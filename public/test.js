// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// function search(ele) {
//   var input, filter, option, tbody, tr;
//   input = document.getElementById("search-orders");
//   option = document.getElementById("search-filter").value;
//   filter = input.value;
//   tbody = document.getElementById("records");
//   tr = tbody.getElementsByTagName("tr");
//   switch (parseInt(option)) {
//     case 0:
//       for (i = 0; i < tr.length; i++) {
//         th = tr[i].getElementsByTagName("th")[0];
//         if (th) {
//           idValue = th.textContent || th.innerText;
//           if (idValue === filter) {
//             tr[i].style.display = "";
//           } else if (filter === "") {
//             tr[i].style.display = "";
//           } else {
//             tr[i].style.display = "none";
//           }
//         }
//       }
//       break;
//     case 2:
//       filter = filter.toUpperCase();
//       searchStringRecords(tr, filter, option);
//       break;
//     case 6:
//       filter = filter.toUpperCase();
//       searchStringRecords(tr, filter, option);
//       break;
//     case 7:
//       filter = filter.toUpperCase();
//       searchStringRecords(tr, filter, option);
//       break;
//   }
// }

function searchStringRecords(tr, filter, option) {
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[option];
    console.log(td);
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function search(ele) {
  var input, filter, option, tbody, tr;
  input = document.getElementById("search");
  option = document.getElementById("search-filter").value;
  filter = input.value;
  tbody = document.getElementById("records");
  tr = tbody.getElementsByTagName("tr");
  switch (parseInt(option)) {
    case 0:
      for (i = 0; i < tr.length; i++) {
        th = tr[i].getElementsByTagName("th")[0];
        if (th) {
          idValue = th.textContent || th.innerText;
          if (idValue === filter) {
            tr[i].style.display = "";
          } else if (filter === "") {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
      break;
    case 1:
      filter = filter.toUpperCase();
      searchStringRecords(tr, filter, option - 1);
      break;
    case 2:
      filter = filter.toUpperCase();
      searchStringRecords(tr, filter, option - 1);
      break;
    case 4:
      filter = filter.toUpperCase();
      searchStringRecords(tr, filter, option - 1);
      break;
    case 6:
      filter = filter.toUpperCase();
      searchStringRecords(tr, filter, option - 1);
      break;
    case 8:
      filter = filter.toUpperCase();
      searchStringRecords(tr, filter, option - 1);
      break;
    case 9:
      filter = filter.toUpperCase();
      searchStringRecords(tr, filter, option - 1);
      break;
  }
}
function edit_products(id, name, category) {
  document.getElementById("product_name").value = name;
  switch (category) {
    case "Liquid":
      document.getElementById("radio").selectedIndex = 0;
      break;
    case "Fragile":
      document.getElementById("radio").selectedIndex = 1;
      break;
    case "Chemical":
      document.getElementById("radio").selectedIndex = 2;
      break;
    case "Regular":
      document.getElementById("radio").selectedIndex = 3;
      break;
  }
  document.getElementById("modifybtn").formAction =
    "/display-products2?modify=" + id;

  document.getElementById("deletebtn").formAction =
    "/display-products2?deleter=" + id;
}

function edit_packages(id, pid, cid, date, height, width, cost, status) {
  document.getElementById("pid").value = pid;
  document.getElementById("cid").value = cid;
  document.getElementById("date").value = date;
  document.getElementById("height").value = height;
  document.getElementById("width").value = width;
  document.getElementById("cost").value = cost;

  switch (status) {
    case "Pending":
      document.getElementById("status").selectedIndex = 0;
      break;
    case "Delivered":
      document.getElementById("status").selectedIndex = 1;
      break;
    case "In Transit":
      document.getElementById("status").selectedIndex = 2;
      break;
    case "Canceled":
      document.getElementById("status").selectedIndex = 3;
      break;
  }
  document.getElementById("savebtn").formAction =
    "/display-packages2?modify=" + id;

  document.getElementById("deletebtn").formAction =
    "/display-packages2?deleter=" + id;
}
