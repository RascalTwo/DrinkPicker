const drinkOptionsContainer = document.querySelector('#drink-options');
const drinkContainer = document.querySelector('#drink');

const form = document.querySelector('#search-by-name')

/**
 * @typedef {object} Drink
 * @property {string} idDrink
 * @property {string} strDrink
 * @property {?string} strDrinkAlternate
 * @property {string} strTags
 * @property {?string} strVideo
 * @property {string} strCategory
 * @property {?string} strIBA
 * @property {'Alcoholic' | 'Non alcoholic'} strAlcoholic
 * @property {string} strGlass
 * @property {string} strInstructions
 * @property {?string} strInstructionsES
 * @property {?string} strInstructionsDE
 * @property {?string} strInstructionsFR
 * @property {?string} strInstructionsIT
 * @property {?string} strInstructionsZH-HANS
 * @property {?string} strInstructionsZH-HANT
 * @property {string} strDrinkThumb
 * @property {?string} strIngredient1
 * @property {?string} strIngredient2
 * @property {?string} strIngredient3
 * @property {?string} strIngredient4
 * @property {?string} strIngredient5
 * @property {?string} strIngredient6
 * @property {?string} strIngredient7
 * @property {?string} strIngredient8
 * @property {?string} strIngredient9
 * @property {?string} strIngredient10
 * @property {?string} strIngredient11
 * @property {?string} strIngredient12
 * @property {?string} strIngredient13
 * @property {?string} strIngredient14
 * @property {?string} strIngredient15
 * @property {?string} strMeasure1
 * @property {?string} strMeasure2
 * @property {?string} strMeasure3
 * @property {?string} strMeasure4
 * @property {?string} strMeasure5
 * @property {?string} strMeasure6
 * @property {?string} strMeasure7
 * @property {?string} strMeasure8
 * @property {?string} strMeasure9
 * @property {?string} strMeasure10
 * @property {?string} strMeasure11
 * @property {?string} strMeasure12
 * @property {?string} strMeasure13
 * @property {?string} strMeasure14
 * @property {?string} strMeasure15
 * @property {?string} strImageSource
 * @property {?string} strImageAttribution
 * @property {'Yes' | 'No'} strCreativeCommonsConfirmed
 * @property {?string} dateModified
 */

const API = {
    /**
     * @param {string} query Drink name to search for
     * @returns {Promise<Drink[]>}
     */
    search(query) {
        const url = new URL('https://www.thecocktaildb.com/api/json/v1/1/search.php');
        url.searchParams.set('s', query);
        return fetch(url)
            .then(response => response.json())
            .then(({ drinks }) => (drinks || []));
    },
    /**
     * @param {string} id ID of drink to lookup
     * @returns {Promise<Drink | null>}
     */
    lookup(id) {
        const url = new URL('https://www.thecocktaildb.com/api/json/v1/1/lookup.php');
        url.searchParams.set('i', id);
        return fetch(url)
            .then(response => response.json())
            .then(({ drinks }) => (drinks || [null])[0]);
    }
}

const UI = {
    searchForDrink: (query) => API.search(query).then(drinks => {
        window.location.hash = '';
        if (!drinks.length) throw new Error('No Drinks Found');

        if (drinks.length === 1) displayDrink(drinks[0]);
        else displayDrinkOptions(drinks);
    }).catch(error => alert(error.message))
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    return UI.searchForDrink(event.target.elements[0].value.trim());
});


(() => {
    const datalist = form.querySelector('datalist');
    let timeout = null;

    const input = form.querySelector('input')

    input.addEventListener('keydown', ({ key }) => {
        // If keyboared was from typing return, otherwise was from choice of autocomplete suggestion
        if (key) return;

        setTimeout(() => UI.searchForDrink(input.value), 100)
    });

    // TODO - prevent autocomplete after entry has been clicked
    input.addEventListener('input', ({ target: { value } }) => {
        clearTimeout(timeout);
        if (!value) return;

        timeout = setTimeout(() => API.search(value)
            .then(drinks => {
                if (!drinks.length) return;
                drinks[0].strDrinkAlternate

                const options = drinks.map(({ strDrink }) => {
                    const option = document.createElement('option');
                    option.value = strDrink;
                    return option
                }).reduce((fragment, option) => {
                    fragment.appendChild(option)
                    return fragment
                }, document.createDocumentFragment());
                datalist.innerHTML = '';
                datalist.appendChild(options);
            }), 500)
    });
})();

(() => {
    let animating = true;
    let index = 0;
    let direction = 1;
    setInterval(() => {
        if (!animating) return;

        if (!drinkOptionsContainer.childElementCount) return;
        if (drinkOptionsContainer.contains(document.activeElement)) return;

        drinkOptionsContainer.children[index].scrollIntoView();
        index += direction;
        if (drinkOptionsContainer.children[index]) return;

        direction = -direction;
        index += direction;
    }, 2500);

    drinkOptionsContainer.addEventListener('mouseenter', () => animating = false);
    drinkOptionsContainer.addEventListener('mousedown', () => animating = false);

    drinkOptionsContainer.addEventListener('mouseleave', () => animating = true);
})();

function displayDrinkOptions(drinks) {
    drinkContainer.classList.add('hidden');


    const fragment = document.createDocumentFragment()
    for (const drink of drinks) {
        const div = document.createElement('div')

        const anchor = document.createElement('a')
        anchor.href = '#idDrink=' + drink.idDrink;
        anchor.addEventListener('click', () => displayDrink(drink));

        const img = document.createElement('img')
        img.src = `${drink.strDrinkThumb}/preview`
        img.title = img.alt = drink.strDrink
        anchor.appendChild(img)

        const title = document.createElement('span')
        title.textContent = drink.strDrink
        anchor.appendChild(title)

        div.appendChild(anchor)
        fragment.appendChild(div)
    }
    drinkOptionsContainer.innerHTML = '';
    drinkOptionsContainer.appendChild(fragment);


    drinkOptionsContainer.classList.remove('hidden');
}

function displayDrink(drink) {
    drinkOptionsContainer.classList.add('hidden');
    window.location.hash = '#idDrink=' + drink.idDrink;


    drinkContainer.querySelector('h2').textContent = drink.strDrink;
    drinkContainer.querySelector('img').src = drink.strDrinkThumb;
    drinkContainer.querySelector('p').innerHTML = drink.strInstructions;


    const ingredientsTable = drinkContainer.querySelector('#ingredients-table')
    ingredientsTable.tBodies[0].remove();
    const ingredientsBody = ingredientsTable.createTBody()
    let html = '';
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        if (!ingredient) break;
        const measure = drink[`strMeasure${i}`] || '';

        const row = ingredientsBody.insertRow();

        const img = document.createElement('img');
        img.src = `https://www.thecocktaildb.com/images/ingredients/${ingredient}-Small.png`
        img.alt = img.title = ingredient
        row.insertCell().appendChild(img);

        row.insertCell().textContent = measure;
    }

    html = '';
    for (const [left, key] of Object.entries({
        Content: 'strAlcoholic',
        Category: 'strCategory',
        Glass: 'strGlass',
        Modified: 'dateModified'
    })) {
        if (!drink[key]) continue;
        html += `<tr><td>${left}</td><td>${drink[key]}</td></tr>`;
    }
    drinkContainer.querySelector('tbody').innerHTML = html;

    drinkContainer.classList.remove('hidden');
}


function handleHashChange() {
    const idDrink = new URLSearchParams(window.location.hash.slice(1)).get('idDrink')
    if (!idDrink) {
        drinkContainer.classList.add('hidden');
        drinkOptionsContainer.classList.toggle('hidden', !drinkOptionsContainer.childElementCount);
        return;
    }
    return API.lookup(idDrink).then(drink => {
        if (!drink) throw new Error('Invalid Drink ID');
        displayDrink(drink);
    });
}
window.addEventListener('hashchange', handleHashChange);
handleHashChange();