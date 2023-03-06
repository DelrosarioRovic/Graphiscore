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
const searchBar = document.querySelector("#search");
const search_Result_main = document.getElementById('search-results-bar');
document.querySelector("#search").addEventListener('click', function() {
  document.querySelector(".hide-right-nav").classList.add("if-press-hide");
  document.querySelector(".right-nav").style.width = "100%";
});
document.addEventListener("click", function(event){
  if (!searchBar.contains(event.target)) {
    document.querySelector(".hide-right-nav").classList.remove("if-press-hide");
    search_Result_main.innerHTML = "";
    searchBar.value = "";
    search_Result_main.style.display = "none";
  }
});
//search function

searchBar.addEventListener('input', () => {
  const searchTerm = searchBar.value.trim();

  if (searchTerm) {
    // Make an AJAX request to the server to search for users
    fetch(`/search_bar?displayName=${encodeURIComponent(searchTerm)}`)
      .then(response => response.json())
      .then(users => {
        // Clear the search results
        search_Result_main.innerHTML = '';

        // Render the search results
        users.forEach(user => {
          search_Result_main.style.display = "flex";
          const userLink = document.createElement('a');
          const userText = document.createElement('p');
          userLink.href = "/profile/" + user._id; // Replace with your own URL format
          userText.textContent = user.displayName;

          if (user.profilePicUrl) {
            const primgSearch = document.createElement('img');
            primgSearch.src = user.profilePicUrl;
            userLink.appendChild(primgSearch);
          }
          else {
            const primgSearch = document.createElement('img');
            primgSearch.src = "/imgs/login.jpg";
            userLink.appendChild(primgSearch);
          }           
          userLink.appendChild(userText);
          search_Result_main.appendChild(userLink);
        });                      
      })
      .catch(error => {
        console.error(error);
        search_Result_main.innerHTML = 'Error searching for users';
      });
  } else {
    // Clear the search results if search input is empty
    search_Result_main.innerHTML = '';
  }
});



//
//user-login
try {
  const userLoginContainer = document.querySelector('.user-login-container');
  const userContent = document.querySelector('.dropdown-content-user');

function toggleDropdown() {
  userLoginContainer.classList.toggle('clicked');
  userContent.classList.toggle('clicked');
}

if (window.innerWidth < 767) {
  userLoginContainer.removeEventListener('click', toggleDropdown);
} else {
  userLoginContainer.addEventListener('click', toggleDropdown);
}

window.addEventListener('resize', () => {
  if (window.innerWidth < 767) {
    userLoginContainer.removeEventListener('click', toggleDropdown);
  } else {
    userLoginContainer.addEventListener('click', toggleDropdown);
  }
});
} catch (error) {
  
}





//star rate
const rateComment = document.getElementById('rate-comment');
document.querySelectorAll('.star-widget input[type="radio"]').forEach(input => {
  input.addEventListener('change', () => {
    rateComment.textContent = input.checked ? ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'][input.getAttribute('id').split('-')[1] - 1] : 'Please rate this product';
  });
});

// average star graphics
function insertRatingHTML(id) {
  const containers = document.querySelectorAll(id);

  containers.forEach((container) => {
    container.insertAdjacentHTML("beforeend", `
      <div class="rating">
        <div class="rating-upper" style="width: 0%">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
        <div class="rating-lower">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
      </div>
    `);
  });
}

insertRatingHTML(".star-rating-home");
insertRatingHTML(".star-rating-user");
insertRatingHTML(".rating-average");
insertRatingHTML(".star-rating-review");
insertRatingHTML(".star-rating-useracc");

function StarAverageRating(graphicsStar, average) {
  for (let index = 0; index < average.length; index++) {
    let ratings = parseFloat(average[index].textContent);
    ratings = (ratings === 5) ? 100 : ratings * 20; // if rating is 5, set it to 100; otherwise, multiply by 20
    console.log(ratings);
    graphicsStar[index].style.width = ratings + "%";
  }
}
// home products averating graphics rating
const ratingUpper = document.querySelectorAll(".star-rating-home .rating-upper");
const ratingElement = document.querySelectorAll(".av-home");

StarAverageRating(ratingUpper, ratingElement);


// moreinfo user products averating graphics rating
const ratingUpper1 = document.querySelectorAll(".star-rating-user .rating-upper");
const ratingElement1 = document.querySelectorAll(".av-user");

StarAverageRating(ratingUpper1, ratingElement1);

// moreinfo overall products averating graphics rating
const ratingUpper2 = document.querySelectorAll(".rating-average .rating-upper");
const ratingElement2 = document.querySelectorAll(".average-value");
StarAverageRating(ratingUpper2, ratingElement2);

// review products averating graphics rating
const ratingUpper3 = document.querySelectorAll(".star-rating-review .rating-upper");
const ratingElement3 = document.querySelectorAll("#av");
StarAverageRating(ratingUpper3, ratingElement3);

// user account products averating graphics rating
const ratingUpper5 = document.querySelectorAll(".star-rating-useracc .rating-upper");
const ratingElement5 = document.querySelectorAll(".av-user-account");
StarAverageRating(ratingUpper5, ratingElement5);

// ----------------------------------------
  
const searchInput = document.getElementById('search-product-review');
const searchResults = document.getElementById('search-results-review');
const reviewContainer = document.getElementById('review-container');

try {
  var ifclickHide = searchResults.style.display;
  document.addEventListener("click", function(event){
  if (!searchInput.contains(event.target)) {
    searchResults.style.display = "none"
    searchInput.value = searchInput.placeholder;
  }
});
} catch (error) {
  
}

try {
  searchInput.addEventListener('click', async () => {
    if (ifclickHide === "") {
      searchResults.style.display = "block";
    }
    // If the search review is clicked, the value will be reset
    searchInput.value = "";
    searchInput.dispatchEvent(new Event('input'));  
  });

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

    const productResults = document.querySelectorAll('.product-result');

    productResults.forEach(productResult => {
      productResult.addEventListener('click', async () => {
        // get id from frontend to backend review and 
        const productId = productResult.getAttribute('data-product-id');
        const response = await fetch(`/review-count?id=${productId}`);
        // return the value to display
        const json = await response.json();
        reviewContainer.querySelector("#ratings").textContent = `${json.rateCount} Ratings`;
        reviewContainer.querySelector("#reviews").textContent = `${json.reviewCount} Reviews`;
        const average = reviewContainer.querySelector("#av").textContent = `${json.avgRating}`;
        // average star
        const ratingUpper4 = document.querySelectorAll("#av");
        const ratingsUpper4 = document.querySelectorAll(".star-rating-review .rating-upper");
        StarAverageRating(ratingsUpper4, ratingUpper4);

        const productName = productResult.textContent;
        const product = products.find(p => p.productName === productName);
        const productImage = product.productImage;
        reviewContainer.querySelector('h3').textContent = productName;
        const img = reviewContainer.querySelector("img");
        img.setAttribute('src', `data:image/png;base64,${productImage}`);
        img.setAttribute('alt', productName); 
      
        searchInput.setAttribute('placeholder', productName);  
        searchInput.value = searchInput.placeholder;
      });
    });
  });

  } catch (error) {
  console.log(error);
}

//loading text animation
try {
  function applySkeletonLoading(id) {
    const element = document.querySelector(id);
  
    // Add the skeleton class to the element if it's empty
    if (element.textContent ==="") {
      element.classList.add('skeleton', 'skeleton-text');
    }
  
    // Remove the skeleton class when the element's <p> element has content
    element.addEventListener('DOMSubtreeModified', () => {
      if (element.textContent !== '') {
        element.classList.remove('skeleton', 'skeleton-text');
      }
    });
  }
applySkeletonLoading('#reviews');
applySkeletonLoading('#product-name');
applySkeletonLoading('#ratings');
} catch (error) {}


//loading img animation 
try {
  function applySkeletonLoadingImg(id) {
    const element = document.querySelector(id);
  
    // Add the skeleton class to the element if it's empty
    if (element.src ==="data:image/png;base64,") {
      element.classList.add('skeleton-img');
    }
  
    // Remove the skeleton class when the element's <p> element has content
    element.addEventListener('DOMSubtreeModified', () => {
      if (element.src !=="data:image/png;base64,") {
        element.classList.remove('skeleton-img');
      }
    });
  }
  applySkeletonLoadingImg('#img-skeleton');
} catch (error) {}






//handling error 















  