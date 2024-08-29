import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';

// if (module.hot) {
// 	module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
	try {
		const id = window.location.hash.slice(1);

		if (!id) return;
		recipeView.renderSpinner();

		resultsView.update(model.getSearchResultsPage());

		bookmarkView.update(model.state.bookmarks);

		await model.loadRecipe(id);

		recipeView.render(model.state.recipe);
	} catch (err) {
		recipeView.renderError();
	}
};

const controlSearchResults = async function () {
	try {
		resultsView.renderSpinner();
		const query = searchView.getQuery();

		if (!query) return;
		await model.loadSearchResults(query);
		resultsView.render(model.getSearchResultsPage(1));

		paginationView.render(model.state.search);
	} catch (err) {}
};

const controlPagination = function (btn) {
	if (btn.classList.contains('pagination__btn--prev'))
		model.state.search.page--;
	if (btn.classList.contains('pagination__btn--next'))
		model.state.search.page++;

	resultsView.render(model.getSearchResultsPage());
	paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
	if (newServings < 1) return;
	model.updateServings(newServings);
	recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
	if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
	else model.deleteBookmark(model.state.recipe.id);

	recipeView.update(model.state.recipe);

	bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
	bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecepie) {
	try {
		addRecipeView.renderSpinner();
		await model.uploadRecipe(newRecepie);
		recipeView.render(model.state.recipe);
		addRecipeView.renderMessage();
		bookmarkView.render(model.state.bookmarks);
		window.history.pushState(null, '', `#${model.state.recipe.id}`);
		setTimeout(function () {
			addRecipeView.toogleWindow();
		}, MODAL_CLOSE_SEC * 1000);
	} catch (err) {
		addRecipeView.renderError(err.message);
	}
};

const init = function () {
	bookmarkView.addHandlerRender(controlBookmarks);
	recipeView.addHandlerRender(controlRecipes);
	recipeView.addHandlerUpdateServings(controlServings);
	recipeView.addHandlerBookmark(controlAddBookmark);
	searchView.addHandlerSearch(controlSearchResults);
	paginationView.addHandlerClick(controlPagination);
	addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
