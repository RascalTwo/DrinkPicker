const drinkOptionsContainer = document.querySelector('#drink-options');
const drinkContainer = document.querySelector('#drink');

const form = document.querySelector('#search-by-name')

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = event.target.elements[0].value.trim();
    const url = new URL('https://www.thecocktaildb.com/api/json/v1/1/search.php');
    url.searchParams.set('s', query);
    window.location.hash = '';
    fetch(url)
        .then(response => response.json())
        .then(({ drinks }) => {
            if (!drinks) throw new Error('No Drinks Found')
            if (drinks.length === 1) displayDrink(drinks[0]);
            displayDrinkOptions(drinks);
        }).catch(error => alert(error.message));
});


(() => {
    const datalist = form.querySelector('datalist');
    let timeout = null;
    form.querySelector('input').addEventListener('input', ({ target: { value } }) => {
        clearTimeout(timeout);
        if (!value) return;

        timeout = setTimeout(() => {
            const url = new URL('https://www.thecocktaildb.com/api/json/v1/1/search.php');
            url.searchParams.set('s', value);
            fetch(url)
                .then(response => response.json())
                .then(({ drinks }) => {
                    if (!drinks) return;

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
                });
        }, 500)
    });
})();

(() => {
    const idDrink = new URLSearchParams(window.location.hash.slice(1)).get('idDrink')
    if (!idDrink) return;
    const url = new URL('https://www.thecocktaildb.com/api/json/v1/1/lookup.php');
    url.searchParams.set('i', idDrink);
    fetch(url)
        .then(response => response.json())
        .then(({ drinks }) => {
            if (!drinks) return alert('Invalid Drink ID');
            displayDrink(drinks[0]);
        });
})();

(() => {
    let animating = true;
    let index = 0;
    let direction = 1;
    setInterval(() => {
        if (!animating) return;

        if (!drinkOptionsContainer.children.length) return;
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


    drinkContainer.querySelector('h2').textContent = drink.strDrink;
    drinkContainer.querySelector('img').src = drink.strDrinkThumb;
    drinkContainer.querySelector('p').innerHTML = drink.strInstructions;


    let html = '';
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        if (!ingredient) break;
        const measure = drink[`strMeasure${i}`] || '';
        html += `<tr><td><img src="https://www.thecocktaildb.com/images/ingredients/${ingredient}-Small.png" alt="${ingredient}" title="${ingredient}" /></td><td>${measure}</td></tr>`
    }
    drinkContainer.querySelector('#ingredients-table tbody').innerHTML = html;

    html = '';
    for (const [left, key] of Object.entries({
        Content: 'strAlcoholic',
        Category: 'strCategory',
        Glass: 'strGlass',
        Modified: 'dateModified'
    })) {
        html += `<tr><td>${left}</td><td>${drink[key]}</td></tr>`;
    }
    drinkContainer.querySelector('tbody').innerHTML = html;

    drinkContainer.classList.remove('hidden');
}