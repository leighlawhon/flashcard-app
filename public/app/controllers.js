angular.module("FlashcardCtrls", ['FlashcardServices'])
.controller("FlashcardCtrl", ['$scope', '$interval', '$modal', 'Flashcard', function($scope, $interval, $modal, Flashcard) {
	$scope.flashcards = [];
	$scope.selectedIdx = null;
	$scope.timer = null;

	Flashcard.query(function success(data) {
		var shuffleData = shuffle(data);	
			$scope.flashcards = shuffleData;
	}, function error(data) {
		console.log(data);
	});

	// -> Fisher–Yates shuffle algorithm
	function shuffle(arr) {
		var m = arr.length, t, i;
		// While there remain elements to shuffle…
		while (m) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);
			// And swap it with the current element.
			t = arr[m];
			arr[m] = arr[i];
			arr[i] = t;
		}
		return arr;
	}

	function start() {
		$scope.timer = $interval(function () {
			$scope.selectedIdx = $scope.selectedIdx === null ? 0 : $scope.selectedIdx+1;
				if($scope.selectedIdx === $scope.flashcards.length) {
					$scope.selectedIdx = 0;
				}
		}, 1000);
	}
	start();

	 $scope.showUpdate = function(idx) {
		var modalInstance = $modal.open({
			templateUrl: "app/views/update.html",
			controller: "FlashcardUpdateCtrl",
			controllerAs: "ctrl",
			size: "md",
			resolve: {
				item: function() {
					return $scope.flashcards[idx];
				},
				index: function() {
					return idx;
				}
			}
		});	
	}
}])
.controller('FlashcardNewCtrl', [
	'$scope',
	'$location',
	'Flashcard',
	function($scope, $location, Flashcard) {
		$scope.createFlashcard = function() {
			var params = {
				front: $scope.front,
				back: $scope.back,
				image: $scope.image,
				category: $scope.category
			}
			var newFlashcard = new Flashcard(params);
			newFlashcard.$save();
			$location.path("/");
		}
}])
.controller('FlashcardDeleteCtrl', [
	'$location',
	'$routeParams',
	'Flashcard',
	function($location, $routeParams, Flashcard) {
		Flashcard.remove({id:$routeParams.id}, function success(data) {
			$location.path("/");
		}, function error(data) {
			console.log(data);
		});
}])
.controller('FlashcardUpdateCtrl', [
	'$scope',
	'$location',
	'$routeParams',
	'Flashcard',
	"item",
	function($scope, $location, $routeParams, Flashcard, item) {			
		console.log("********************");
		console.log(item);
		console.log("********************");

		$scope.item = item;
		console.log($scope.item._id);
		
		$scope.putFlashcard = function () {
			var params = {
				front: $scope.front,
				back: $scope.back,
				image: $scope.image,
				category: $scope.category
			} 
			Flashcard.update({id: $scope.item._id}, params);
			$location.path("/");
		}	
}])
.controller("NavCtrl", ['$scope', 'Auth', function($scope, Auth) {
	$scope.logout = function() {
		Auth.removeToken();
	};
}])
.controller("LoginCtrl", [
	'$scope',
	'$http',
	'$location',
	'Auth',
	function($scope, $http, $location, Auth) {
		$scope.user = {
			email: "",
			password: ""
		};
		$scope.actionName = "Login";
		$scope.userAction = function() {
			$http.post("/api/auth", $scope.user).then(function success(res) {
					Auth.saveToken(res.data.token);
					$location.path("/");
			}, function error(res) {
					console.log(res.data);
			});
		};
}])
.controller("SignupCtrl", [
	'$scope',
	'$http',
	'$location',
	'Auth',
	function($scope, $http, $location, Auth) {
		$scope.user = {
			email: "",
			password: ""
		};
		$scope.actionName = "Signup";
		$scope.userAction = function() {
			$http.post("/api/users", $scope.user).then(function success(res) {
				$http.post("/api/auth", $scope.user).then(function success(res) {
						Auth.saveToken(res.data.token);
						$location.path("/");
				}, function error(res) {
						console.log(res.data);
				});
			}, function error (res) {
						console.log(res.data);
			});
		}
}]);

