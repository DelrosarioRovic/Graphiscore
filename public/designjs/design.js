

const button = document.querySelector('.dropdown-button');
const content = document.querySelector('.dropdown-content');

//drop down
button.addEventListener('click', function() {
  var mainNav = document.querySelector(".main-nav").style.display;
  if (mainNav === 'flex') {
    document.querySelector(".main-nav").style.display = 'none';
  } else {
    document.querySelector(".main-nav").style.display = 'flex';
  }
});

//more menu nav
NewMenu = document.querySelector(".nav-menu");
xButton = document.querySelector(".x-menu");
NewMenu.onclick = function() {
  Navbar = document.querySelector("#myTopnav");
  Navbar.classList.toggle("active");
  xButton.classList.add("if-press-show");
  NewMenu.classList.add("if-press-hide");
}
xButton.onclick = function() {
  Navbar = document.querySelector("#myTopnav");
  Navbar.classList.toggle("active");
  NewMenu.classList.remove("if-press-hide");
  xButton.classList.remove("if-press-show");
}



//expand search bar to 100% and hide others
const searchBar = document.querySelector(".search");

document.querySelector("#search").addEventListener('click', function() {
  document.querySelector(".hide-right-nav").classList.add("if-press-hide");
  document.querySelector(".right-nav").style.width = "100%";

});
document.addEventListener("click", function(event){
  if (!searchBar.contains(event.target)) {
    document.querySelector(".hide-right-nav").classList.remove("if-press-hide");
  }
  if (ifclickHide === "block") {
    searchResults.style.display = "none";
  }
});

//user-login
const userLoginContainer = document.querySelector('.user-login-container');
const userContent = document.querySelector('.dropdown-content-user');
  try {
    userLoginContainer.addEventListener('click', () => {
      console.log("right");
    userLoginContainer.classList.toggle('clicked');
    userContent.classList.toggle('clicked');
  });
  } catch (error) {
    console.log(error);
  }
    

// search bar at review section
// const searchInput = document.getElementById('search-product-review');
// const searchResults = document.getElementById('search-results-review');
// // declare vars = if hide or not the search results
// var ifclickHide = searchResults.style.display;
// try {
//   searchInput.addEventListener('input', async () => {
//     const searchTerm = searchInput.value.trim();
//     console.log(searchTerm);
  
    
//     const response = await fetch('/search?q=' + searchTerm);
//     const products = await response.json();
//     const resultsHtml = products.map(product => `<p class="product-result" data-product-id="${product._id}">${product.productName}</p>`).join('');
//     searchResults.innerHTML = resultsHtml;
//     if (searchTerm === '') {
//       searchResults.innerHTML = '';
//       return;
//     }
  
//     // Add click event listener to each product result
//     const productResults = document.querySelectorAll('.product-result');
//     const reviewContainer = document.getElementById('review-container');
//     const inputElement = document.querySelector('#search-product-review');
//     productResults.forEach(productResult => {
//       productResult.addEventListener('click', async () => {
//         const productId = productResult.dataset.productId;
//         console.log(`Clicked product with ID ${productId}`);
  
//         // Send product ID to backend using a POST request
//         const response = await fetch('/fetchingproduct', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ productId })
//         });
//         const data = await response.json();
//         reviewContainer.querySelector('h3').textContent = data.productName.productName;
       
//         const imgs = data.productName.productImage;
//         const img = reviewContainer.querySelector("img");
//         img.setAttribute('src', `data:image/png;base64,${imgs}`);
//         img.setAttribute('alt', data.productName.productName); 
  
//         inputElement.setAttribute('placeholder', data.productName.productName);  
//         inputElement.value = ""; 

        
//         if (ifclickHide === "") {
//           searchResults.style.display = "none";
//         } 
//       });
//     });
//   });
//   searchInput.addEventListener('click', async () => {
//     console.log(ifclickHide);
//     if (ifclickHide === "") {
//       searchResults.style.display = "block";
//     }
//   });
// } catch (error) {
//   console.log(error);
// }





const searchInput = document.getElementById('search-product-review');
const searchResults = document.getElementById('search-results-review');
let ifclickHide = searchResults.style.display;
// let textSearch = searchInput.getAttribute('placeholder');
try {
  searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.trim();
    
    let url;
    if (searchTerm === '') {
      url = '/allproducts';
    } else {
      url = `/search?q=${searchTerm}`;
    }

    const response = await fetch(url);
    const products = await response.json();
    const resultsHtml = products.map(product => `<p class="product-result" data-product-id="${product._id}">${product.productName}</p>`).join('');
    searchResults.innerHTML = resultsHtml;
    if (searchTerm === '') {
      searchResults.innerHTML = '';
      return;
    }
  
    const productResults = document.querySelectorAll('.product-result');
    const reviewContainer = document.getElementById('review-container');
    const inputElement = document.querySelector('#search-product-review');
    productResults.forEach(productResult => {
      productResult.addEventListener('click', async () => {
        const productId = productResult.dataset.productId;
  
        const response = await fetch('/fetchingproduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });
        const data = await response.json();
        reviewContainer.querySelector('h3').textContent = data.productName.productName;
       
        const imgs = data.productName.productImage;
        const img = reviewContainer.querySelector("img");
        img.setAttribute('src', `data:image/png;base64,${imgs}`);
        img.setAttribute('alt', data.productName.productName); 
  
        inputElement.setAttribute('placeholder', data.productName.productName);  
        inputElement.value = inputElement.placeholder;

        if (ifclickHide === "") {
          searchResults.style.display = "none";
        } 
      });
    });
  });

  searchInput.addEventListener('click', async () => {
    if (ifclickHide === "") {
      searchResults.style.display = "block";
    }
    // if search review click the value will reset
    searchInput.value = "";
  });
} catch (error) {
  console.log(error);
}



  















  