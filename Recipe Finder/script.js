document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const recipeResults = document.getElementById('recipe-results');
    const welcomeMessage = document.getElementById('welcome-message');
    
    // Event listeners
    searchBtn.addEventListener('click', searchRecipes);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchRecipes();
        }
    });

    // Fetch recipes from TheMealDB API
    async function searchRecipes() {
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            showMessage('Please enter a search term');
            return;
        }

        showLoading(true);
        welcomeMessage.style.display = 'none';
        
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
            const data = await response.json();
            
            if (data.meals === null) {
                showMessage('No recipes found. Try a different search term.');
                return;
            }
            
            displayRecipes(data.meals);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            showMessage('Failed to fetch recipes. Please try again later.');
        } finally {
            showLoading(false);
        }
    }

    // Display recipes in the UI
    function displayRecipes(meals) {
        recipeResults.innerHTML = '';
        
        meals.forEach(meal => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            // Limit instructions to 150 characters for the card
            const shortInstructions = meal.strInstructions.length > 150 
                ? meal.strInstructions.substring(0, 150) + '...' 
                : meal.strInstructions;
            
            recipeCard.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-img">
                <div class="recipe-info">
                    <h3 class="recipe-title">${meal.strMeal}</h3>
                    <span class="recipe-category">${meal.strCategory}</span>
                    <p class="recipe-instructions">${shortInstructions}</p>
                    <a href="#" class="view-recipe" data-id="${meal.idMeal}">View Recipe &rarr;</a>
                </div>
            `;
            
            recipeResults.appendChild(recipeCard);
        });
        
        // Add event listeners to view recipe buttons
        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const mealId = e.target.getAttribute('data-id');
                viewRecipeDetails(mealId);
            });
        });
    }
    
    // View detailed recipe
    async function viewRecipeDetails(mealId) {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            const data = await response.json();
            
            if (data.meals && data.meals[0]) {
                const meal = data.meals[0];
                showRecipeModal(meal);
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            showMessage('Failed to load recipe details.');
        }
    }
    
    // Show recipe details in a modal
    function showRecipeModal(meal) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
            overflow-y: auto;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        `;
        
        // Get ingredients and measures
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) {
                ingredients.push({
                    ingredient: meal[`strIngredient${i}`],
                    measure: meal[`strMeasure${i}`]
                });
            }
        }
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Create modal content HTML
        modalContent.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 30px; margin: 20px 0;">
                <div style="flex: 1; min-width: 250px;">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 100%; border-radius: 8px;">
                    <p><strong>Category:</strong> ${meal.strCategory}</p>
                    <p><strong>Area:</strong> ${meal.strArea}</p>
                    ${meal.strTags ? `<p><strong>Tags:</strong> ${meal.strTags.split(',').join(', ')}</p>` : ''}
                </div>
                <div style="flex: 1; min-width: 250px;">
                    <h3>Ingredients</h3>
                    <ul style="margin-left: 20px;">
                        ${ingredients.map(item => 
                            `<li>${item.measure} ${item.ingredient}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
            <div>
                <h3>Instructions</h3>
                <p style="white-space: pre-line;">${meal.strInstructions}</p>
            </div>
            ${meal.strYoutube ? `
            <div style="margin-top: 20px;">
                <h3>Video Tutorial</h3>
                <a href="${meal.strYoutube}" target="_blank" style="color: #e74c3c; text-decoration: none;">
                    Watch on YouTube <i class="fab fa-youtube"></i>
                </a>
            </div>` : ''}
        `;
        
        modalContent.prepend(closeBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Show loading spinner
    function showLoading(show) {
        let loader = document.querySelector('.loader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'loader';
                recipeResults.appendChild(loader);
            }
            loader.style.display = 'block';
        } else if (loader) {
            loader.style.display = 'none';
        }
    }
    
    // Show message to user
    function showMessage(message) {
        recipeResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>${message}</p>
            </div>
        `;
    }
});
