angular.module("recipesApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    recipes: function(Recipes) {
                        return Recipes.getRecipes();
                    }
                }
            })
            .when("/new/recipe", {
                controller: "NewRecipeController",
                templateUrl: "recipe-form.html"
            })
            .when("/recipe/:recipeId", {
                controller: "EditRecipeController",
                templateUrl: "recipe.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Recipes", function($http) {
        this.getRecipes = function() {
            return $http.get("/recipes").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding recipes.");
                });
        }
        this.createRecipe = function(recipe) {
            return $http.post("/recipes", recipe).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating recipe.");
                });
        }
        this.getRecipe = function(recipeId) {
            var url = "/recipes/" + recipeId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this recipe.");
                });
        }
        this.editRecipe = function(recipe) {
            var url = "/recipes/" + recipe._id;
            console.log(recipe._id);
            return $http.put(url, recipe).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this recipe.");
                    console.log(response);
                });
        }
        this.deleteRecipe = function(recipeId) {
            var url = "/recipes/" + recipeId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this recipe.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(recipes, $scope) {
        $scope.recipes = recipes.data;
    })
    .controller("NewRecipeController", function($scope, $location, Recipes) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveRecipe = function(recipe) {
            Recipes.createRecipe(recipe).then(function(doc) {
                var recipeUrl = "/recipe/" + doc.data._id;
                $location.path(recipeUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditRecipeController", function($scope, $routeParams, Recipes) {
        Recipes.getRecipe($routeParams.recipeId).then(function(doc) {
            $scope.recipe = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.recipeFormUrl = "recipe-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.recipeFormUrl = "";
        }

        $scope.saveRecipe = function(recipe) {
            Recipes.editRecipe(recipe);
            $scope.editMode = false;
            $scope.recipeFormUrl = "";
        }

        $scope.deleteRecipe = function(recipeId) {
            Recipes.deleteRecipe(recipeId);
        }
    });
