let repos = []; // Global variable to store repositories
let currentPage = 1; // Global variable to track the current page
let totalPages = 1; // Global variable to track the total number of pages
let reposPerPage = 10; // Global variable to track the number of repositories per page

function getUserDetails() {
    const username = document.getElementById('username').value;

    if (username) {
        fetch(`https://api.github.com/users/${username}`)
            .then(response => response.json())
            .then(user => {
                fetch(`https://api.github.com/users/${username}/repos`)
                    .then(response => response.json())
                    .then(data => {
                        repos = data; // Save repositories to global variable
                        totalPages = Math.ceil(repos.length / reposPerPage);
                        currentPage = 1; // Reset current page
                        displayUserDetails(user);
                        displayRepoDetails(currentPage); // Display first page of repositories
                        displayPagination();
                    })
                    .catch(error => {
                        console.error('Error fetching repositories:', error);
                        displayError();
                    });
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                displayError();
            });
    } else {
        alert('Please enter a GitHub username');
    }
}

function searchRepository() {
    const repoName = prompt('Enter the repository name:');

    if (repoName) {
        const foundRepo = repos.find(repo => repo.name.toLowerCase() === repoName.toLowerCase());

        if (foundRepo) {
            displayRepoDetail(foundRepo);
        } else {
            alert(`Repository "${repoName}" not found.`);
        }
    }
}

function displayUserDetails(user) {
    const userResultContainer = document.getElementById('userResult');
    const repoPerPageContainer = document.querySelector('.repo-per-page-container');

    userResultContainer.innerHTML = '';

    const userCard = document.createElement('div');
    userCard.className = 'user-card';

    userCard.innerHTML = `
        <img src="${user.avatar_url}" alt="Avatar" class="avatar">
        <div class="user-details">
            <h2>${user.login}</h2>
            <p>${user.bio || 'No bio available'}</p>
            <p>Followers: ${user.followers}</p>
        </div>
    `;

    userResultContainer.appendChild(userCard);

    // Display the repo-per-page dropdown after the search
    repoPerPageContainer.style.display = 'block';
}

function displayRepoDetails(page) {
    const repoResultContainer = document.getElementById('repoResult');

    // Clear previous repo results
    repoResultContainer.innerHTML = '';

    const startIndex = (page - 1) * reposPerPage;
    const endIndex = startIndex + reposPerPage;
    const pageRepos = repos.slice(startIndex, endIndex);

    // Display each repository
    pageRepos.forEach(repo => {
        const repoElement = document.createElement('div');
        repoElement.className = 'repo';

        // Fetch and format languages
        getLanguages(repo.languages_url)
            .then(languages => {
                const languagesText = languages.length > 0 ? `Languages: ${languages.join(', ')}` : 'Languages: Not specified';

                repoElement.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>Description: ${repo.description || 'No description'}</p>
                    <p>Stars: ${repo.stargazers_count} <span>&#9733;</span> | Forks: ${repo.forks_count} <span>&#127860;</span></p>
                    <p>${languagesText}</p>
                    <button onclick="window.open('${repo.html_url}', '_blank')">View on GitHub</button>
                `;

                repoResultContainer.appendChild(repoElement);
            })
            .catch(error => {
                console.error('Error fetching languages:', error);
            });
    });
}

function displayRepoDetail(repo) {
    const repoDetailContainer = document.getElementById('repoResult');
    
    // Clear previous repo details
    repoDetailContainer.innerHTML = '';

    const repoDetailCard = document.createElement('div');
    repoDetailCard.className = 'repo-detail';

    getLanguages(repo.languages_url)
        .then(languages => {
            const languagesText = languages.length > 0 ? `Languages: ${languages.join(', ')}` : 'Languages: Not specified';

            repoDetailCard.innerHTML = `
                <h3>${repo.name}</h3>
                <p>Description: ${repo.description || 'No description'}</p>
                <p>Stars: ${repo.stargazers_count} <span>&#9733;</span> | Forks: ${repo.forks_count} <span>&#127860;</span></p>
                <p>${languagesText}</p>
                <button onclick="window.open('${repo.html_url}', '_blank')">View on GitHub</button>
            `;

            repoDetailContainer.appendChild(repoDetailCard);
        })
        .catch(error => {
            console.error('Error fetching languages:', error);
        });
}

function displayPagination() {
    const paginationContainer = document.getElementById('pagination');

    // Clear previous pagination
    paginationContainer.innerHTML = '';

    // Show pagination container
    paginationContainer.style.display = 'flex';

    // "Previous" button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.onclick = prevPage;
    paginationContainer.appendChild(prevButton);

    // Direct access buttons for each page
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => goToPage(i);
        paginationContainer.appendChild(pageButton);
    }

    // Input for page number
    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.min = '1';
    pageInput.max = totalPages.toString();
    pageInput.value = currentPage.toString();
    pageInput.addEventListener('input', () => validatePageInput(pageInput));
    paginationContainer.appendChild(pageInput);

    // "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = nextPage;
    paginationContainer.appendChild(nextButton);

    // Highlight current page button
    const pageButtons = document.querySelectorAll('.pagination-container button');
    pageButtons.forEach(button => {
        if (parseInt(button.textContent) === currentPage) {
            button.classList.add('active');
        }
    });
}

function validatePageInput(input) {
    // Ensure the input value is within valid range
    if (input.value < 1) {
        input.value = '1';
    } else if (input.value > totalPages) {
        input.value = totalPages.toString();
    }
}

function goToPage(page) {
    currentPage = page;
    displayRepoDetails(currentPage);
    highlightCurrentPageButton();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayRepoDetails(currentPage);
        highlightCurrentPageButton();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        displayRepoDetails(currentPage);
        highlightCurrentPageButton();
    }
}

function updateRepoPerPage() {
    const repoPerPageSelect = document.getElementById('repoPerPage');
    reposPerPage = parseInt(repoPerPageSelect.value);
    totalPages = Math.ceil(repos.length / reposPerPage);
    currentPage = 1; // Reset current page
    displayRepoDetails(currentPage);
    displayPagination();
}

function highlightCurrentPageButton() {
    const pageButtons = document.querySelectorAll('.pagination-container button');
    pageButtons.forEach(button => {
        button.classList.remove('active');
        if (parseInt(button.textContent) === currentPage) {
            button.classList.add('active');
        }
    });
}

function getLanguages(url) {
    return fetch(url)
        .then(response => response.json())
        .then(data => Object.keys(data))
        .catch(error => {
            console.error('Error fetching languages:', error);
            return [];
        });
}

function displayError() {
    const userResultContainer = document.getElementById('userResult');
    userResultContainer.innerHTML = '<p class="error">Error fetching user details. Please try again.</p>';
}


