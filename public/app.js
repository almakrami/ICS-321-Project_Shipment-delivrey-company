const { query } = require("express");
const express = require("express");
const mysql = require("mysql");
const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "package_delivery_app",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// Admin and new registered admin information
var admin_id = "";
var admin_name = "";
var admins_array = [];
var client_ID = "";
var unpaidPackages = [];

app.get("/", function (req, res) {
  var passedVariable = req.query.valid;

  res.render("index", { error: passedVariable });
});

app.post("/", function (req, res) {
  let loginE = req.body.login_email;
  let loginP = req.body.login_password;
  connection.query(
    "SELECT a_id, a_email, a_password, permission FROM admin",
    function (err, result) {
      if (err) throw err;
      var adminEmail;
      var adminPassword;
      var permission;

      for (var i = 0; i < result.length; i++) {
        if (result[i].a_email === loginE) {
          admin_id = result[i].a_id;
          adminEmail = result[i].a_email;
          adminPassword = result[i].a_password;
          permission = result[i].permission;
        }
      }
      if (
        loginE === adminEmail &&
        loginP === adminPassword &&
        permission === 1
      ) {
        res.redirect("/admin-home-page");
      } else {
        var message = "Your Email or password is not correct.";
        if (
          loginE === adminEmail &&
          loginP === adminPassword &&
          permission === 0
        ) {
          message = "You haven't been approved by one of our admins yet.";
          res.redirect("/?valid=" + message);
        } else {
          sql = `SELECT * FROM client WHERE c_email = "${loginE}" AND c_password = "${loginP}"`;
          connection.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length === 0) {
              res.redirect("/?valid=" + message);
            } else {
              client_ID = result[0].c_id;
              res.redirect("/client-home-page");
            }
          });
        }
      }
    }
  );
});

app.get("/admin-signup", function (req, res) {
  let error_msg = req.query.error;
  res.render("admin-signup", { error: error_msg });
});
app.post("/admin-signup", (req, res) => {
  let aFname = req.body.admin_fname;
  let aLname = req.body.admin_lname;
  let aEmail = req.body.admin_email;
  let aPassword = req.body.admin_password;
  let aAddress1 = req.body.admin_address1;
  let aAddress2 = req.body.admin_address2;
  let aCity = req.body.admin_city;
  let aState = req.body.admin_state;
  let aZip = req.body.admin_zip;
  let permission = 0;
  var sql = `SELECT c_email as email FROM client WHERE c_email= "${aEmail}"
  UNION ALL 
  SELECT a_email as email FROM admin WHERE a_email= "${aEmail}"`;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length === 0) {
      sql = `INSERT INTO admin ( a_fname, a_lname, a_email, a_password, a_address1, a_address2, a_city, a_state, a_zip, permission) VALUES ("${aFname}", "${aLname}" , "${aEmail}", "${aPassword}", "${aAddress1}", "${aAddress2}", "${aCity}", "${aState}" ,"${aZip}" ,"${permission}")`;
      connection.query(sql, function (err, result) {
        res.redirect("/");
      });
    } else {
      let error = "The email address is already in use.";
      res.redirect("/admin-signup?error=" + error);
    }
  });
});

app.get("/client-home-page", (req, res) => {
  var pending = 0;
  var delivered = 0;
  var canceled = 0;
  var intransit = 0;
  var number = 0;
  var sql = `SELECT * FROM client WHERE c_id = ${client_ID}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    var clientInfo = result;
    sql = `SELECT * FROM package WHERE customer_id = ${client_ID} `;
    connection.query(sql, (err, result) => {
      var packages = result;
      if (err) throw err;
      sql = `SELECT * FROM package WHERE customer_id = ${client_ID} AND status = "Pending"`;
      connection.query(sql, (err, result) => {
        if (err) throw err;
        unpaidPackages = result;
      });
      sql = `SELECT COUNT(package_id) as amount, status FROM package WHERE customer_id = ${client_ID} GROUP BY status`;
      connection.query(sql, (err, result) => {
        if (err) throw err;
        result.forEach((record) => {
          if (record.status === "Pending") {
            pending = record.amount;
          }
          if (record.status === "Delivered") {
            delivered = record.amount;
          }
          if (record.status === "Canceled") {
            canceled = record.amount;
          }
          if (record.status === "In Transit") {
            intransit = record.amount;
          }
        });
        res.render("client-home-page", {
          clientInfo: clientInfo,
          unpaidPackages: unpaidPackages,
          packages: packages,
          number: number,
          pending: pending,
          canceled: canceled,
          intransit: intransit,
          delivered: delivered,
        });
      });
    });
  });
});
app.post("/client-home-page", (req, res) => {
  var confirm = req.query.confirm;
  var cancel = req.query.cancel;
  if (confirm != null) {
    sql = `UPDATE package SET status = 'In Transit', paid = 1 WHERE package_id = ${confirm}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
    });
  } else {
    sql = `UPDATE package SET status = 'Canceled' WHERE package_id = ${cancel}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
    });
  }
  res.redirect("/client-home-page");
});

app.get("/client-signup", function (req, res) {
  let error_msg = req.query.error;
  res.render("client-signup", { error: error_msg });
});
app.post("/client-signup", function (req, res) {
  let cFname = req.body.client_fname;
  let cLname = req.body.client_lname;
  let cEmail = req.body.client_email;
  let cPassword = req.body.client_password;
  let cAddress1 = req.body.client_address1;
  let cAddress2 = req.body.client_address2;
  let cCity = req.body.client_city;
  let cState = req.body.client_state;
  let cZip = req.body.client_zip;
  var sql = `SELECT c_email as email FROM client WHERE c_email= "${cEmail}"
            UNION ALL 
            SELECT a_email as email FROM admin WHERE a_email= "${cEmail}"`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      sql = `INSERT INTO client ( c_fname, c_lname, c_email, c_password, c_address1, c_address2, c_city, c_state, c_zip) VALUES ("${cFname}", "${cLname}" , "${cEmail}", "${cPassword}", "${cAddress1}", "${cAddress2}", "${cCity}", "${cState}" ,"${cZip}" )`;
      connection.query(sql, function (err, result) {
        res.redirect("/");
      });
    } else {
      let error = "The email address is already in use.";
      res.redirect("/client-signup?error=" + error);
    }
  });
});

app.get("/admin-home-page", function (req, res) {
  var number = 0;
  var pending = 0;
  var delivered = 0;
  var intransit = 0;
  var canceled = 0;

  let sql = `SELECT a_fname, a_lname FROM admin WHERE a_id = ${admin_id}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    admin_name = result[0].a_fname + " " + result[0].a_lname;
    sql = "SELECT a_id, a_fname, a_lname FROM admin WHERE permission = 0";
    connection.query(sql, (err, result) => {
      if (err) throw err;
      admins_array = result;
      sql = "SELECT * FROM package LIMIT 7";
      connection.query(sql, (err, result) => {
        if (err) throw err;
        var packages = result;
        sql =
          "SELECT COUNT(package_id) as amount, status FROM package GROUP BY status";
        connection.query(sql, (err, result) => {
          if (err) throw err;
          result.forEach((record) => {
            if (record.status === "Pending") {
              pending = record.amount;
            }
            if (record.status === "Delivered") {
              delivered = record.amount;
            }
            if (record.status === "Canceled") {
              canceled = record.amount;
            }
            if (record.status === "In Transit") {
              intransit = record.amount;
            }
          });
          res.render("admin-home-page", {
            name: admin_name,
            admins_notification: admins_array,
            packages: packages,
            number: number,
            pending: pending,
            delivered: delivered,
            canceled: canceled,
            intransit: intransit,
          });
        });
      });
    });
  });
});

app.post("/admin-home-page", (req, res) => {
  let accept = req.query.confirm;
  let reject = req.query.delete;
  var sql;
  if (accept != null) {
    var sql = `UPDATE admin SET permission = 1 WHERE a_id = ${accept}`;
  } else {
    var sql = `DELETE FROM admin WHERE a_id = ${reject}`;
  }
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.redirect("/admin-home-page");
  });
});
app.get("/admin-profile", (req, res) => {
  var sql = `SELECT a_fname, a_lname, a_email, a_password, a_address1, a_address2, a_zip, a_city , a_state FROM admin WHERE a_id = ${admin_id}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.render("admin-profile", { adminInfo: result });
  });
});
app.get("/display-packages", (req, res) => {
  var sql = "SELECT c_id, c_fname, c_lname From client";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    var Cdata = result;
    sql = "SELECT * FROM product";
    connection.query(sql, (err, result) => {
      if (err) throw err;
      var Pdata = result;
      sql = "SELECT * FROM package ORDER BY package_id";
      connection.query(sql, (err, result) => {
        if (err) throw err;
        var count = 0;
        res.render("display-packages", {
          name: admin_name,
          admins_notification: admins_array,
          customerData: Cdata,
          productData: Pdata,
          number: count,
          packages: result,
        });
      });
    });
  });
});
app.post("/display-packages", (req, res) => {
  var pid = req.body.pid;
  var cid = req.body.cid;
  var date = req.body.date;
  var height = req.body.height;
  var width = req.body.width;
  var cost = req.body.cost;

  var sql = `SELECT p_name, p_barcode, p_category FROM product WHERE p_id = ${pid}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    var pname = result[0].p_name;
    var barcode = result[0].p_barcode;
    var category = result[0].p_category;
    sql = `SELECT c_fname, c_lname, c_state, c_address1, c_city FROM client WHERE c_id = ${cid}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      var fname = result[0].c_fname;
      var lname = result[0].c_lname;
      var state = result[0].c_state;
      var address1 = result[0].c_address1;
      var city = result[0].c_city;
      sql = `INSERT INTO package (pname, barcode, category ,product_id, customer_id, cname, date, height, width, cost, destination, status, paid) VALUES ("${pname}", ${barcode}, "${category}",${pid},${cid},"${fname}  ${lname}", "${date}", ${height}, ${width}, ${cost}, "${state},  ${city},  ${address1}", "Pending", 0)`;
      connection.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect("/display-packages");
      });
    });
  });
});

app.post("/display-packages2", (req, res) => {
  var modify = req.query.modify;
  var deleter = req.query.deleter;

  var date = req.body.date;
  var height = req.body.height;
  var width = req.body.width;
  var cost = req.body.cost;
  var status = req.body.status;
  var sql = `UPDATE package SET date = "${date}", height = ${height} , width = ${width}, cost = ${cost}, status = "${status}" WHERE package_id = ${modify}`;
  if (modify != null) {
    connection.query(sql, (err, result) => {
      if (err) throw err;
    });
  } else {
    sql = `DELETE FROM package WHERE package_id = ${deleter}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
    });
  }
  res.redirect("/display-packages");
});

app.get("/admin-profile-edit", (req, res) => {
  var sql = `SELECT a_fname, a_lname, a_email, a_password, a_address1, a_address2, a_zip, a_city , a_state FROM admin WHERE a_id = ${admin_id}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.render("admin-profile-edit", { adminInfo: result });
  });
});

app.post("/admin-profile-edit", (req, res) => {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var zip = req.body.zip;
  var city = req.body.city;
  var state = req.body.state;
  var address1 = req.body.address1;
  var address2 = req.body.address2;
  var password = req.body.password;

  var sql = `UPDATE admin SET a_fname = "${fname}", a_lname = "${lname}", a_email ="${email}", a_password = "${password}", a_address1 = "${address1}", a_address2 = "${address2}", a_zip ="${zip}", a_city ="${city}" , a_state = "${state}" WHERE a_id = ${admin_id}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.redirect("/admin-profile-edit");
  });
});

app.get("/pending-orders", function (req, res) {
  var number = 0;
  var sql = "SELECT * FROM package WHERE status = 'Pending'";
  connection.query(sql, (err, result) => {
    res.render("pending-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});
app.get("/client-pending-orders", function (req, res) {
  var number = 0;
  var sql = `SELECT * FROM package WHERE status = 'Pending' AND customer_id = ${client_ID}`;
  connection.query(sql, (err, result) => {
    res.render("pending-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});
app.get("/delivered-orders", function (req, res) {
  var number = 0;
  var sql = "SELECT * FROM package WHERE status = 'Delivered'";
  connection.query(sql, (err, result) => {
    res.render("delivered-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});
app.get("/client-delivered-orders", function (req, res) {
  var number = 0;
  var sql = `SELECT * FROM package WHERE status = 'Delivered' AND customer_id = ${client_ID}`;
  connection.query(sql, (err, result) => {
    res.render("delivered-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});
app.get("/canceled-orders", function (req, res) {
  var number = 0;
  var sql = "SELECT * FROM package WHERE status = 'Canceled'";
  connection.query(sql, (err, result) => {
    res.render("canceled-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});
app.get("/client-canceled-orders", function (req, res) {
  var number = 0;
  var sql = `SELECT * FROM package WHERE status = 'Canceled' AND customer_id = ${client_ID}`;
  connection.query(sql, (err, result) => {
    res.render("canceled-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});

app.get("/transit-orders", function (req, res) {
  var number = 0;
  var sql = "SELECT * FROM package WHERE status = 'In Transit'";
  connection.query(sql, (err, result) => {
    res.render("transit-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});
app.get("/client-transit-orders", function (req, res) {
  var number = 0;
  var sql = `SELECT * FROM package WHERE status = 'In Transit' AND customer_id = ${client_ID}`;
  connection.query(sql, (err, result) => {
    res.render("transit-orders", {
      name: admin_name,
      admins_notification: admins_array,
      packages: result,
      number: number,
    });
  });
});
app.get("/display-products", (req, res) => {
  var passedVar = req.query.error;
  var count = 0;
  var sql = `SELECT * FROM  product ORDER BY p_id`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.render("display-products", {
      name: admin_name,
      admins_notification: admins_array,
      products: result,
      number: count,
      error: passedVar,
    });
  });
});

app.post("/display-products", (req, res) => {
  var productName = req.body.productName;
  var category = req.body.category;
  var barcode = Math.floor(10000000 + Math.random() * 90000000);
  var sql = `SELECT p_barcode FROM product WHERE p_barcode = ${barcode}`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      sql = `SELECT p_name from product WHERE p_name = "${productName}"`;
      connection.query(sql, (err, result) => {
        if (result.length === 0) {
          sql = `INSERT INTO product (p_name, p_barcode, p_category) VALUES ("${productName}", ${barcode}, "${category}")`;
          connection.query(sql, (err, result) => {
            if (err) throw err;
            res.redirect("/display-products");
          });
        } else {
          var message = "This product already exists.";
          res.redirect("/display-products?error=" + message);
        }
      });
    }
  });
});
app.post("/display-products2", (req, res) => {
  var modify = req.query.modify;
  var deleter = req.query.deleter;
  var name = req.body.productName;
  var category = req.body.category;
  var sql = `UPDATE product SET p_name = "${name}", p_category = "${category}" WHERE p_id = ${modify}`;
  if (modify != null) {
    connection.query(sql, (err, result) => {
      if (err) throw err;
    });
  } else {
    sql = `DELETE FROM product WHERE p_id = ${deleter}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
    });
  }
  res.redirect("/display-products");
});

app.get("/test", function (req, res) {
  res.render("test");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
