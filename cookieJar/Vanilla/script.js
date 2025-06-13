$("document").ready(() => {
  let player = 1;


  // for use to see if game is over
  let empty1 = false;
  let empty2 = false;
  let empty3 = false;
  let gameOver = false;

  //for use in function to ensure only 1 jar has cookies selected at a time
  let selected1 = false;
  let selected2 = false;
  let selected3 = false;

  // player display
  $("#playerBanner").text(`Player ${player}'s turn`);

  // function that fires when a cookie is clicked inside it's jar to make it show selected
  //did conditional so if no cookies are selected anymore-selectedX is false so any jar can be be pulled from
  let resetJarSelect=()=>{
    if (!$(".cookie").hasClass("selected")) {
      selected1=false
      selected2=false
      selected3=false
    }}

  $("#jar1").on("click", "p", function () {
    if (!selected2 && !selected3){
      selected1=true
      $(this).toggleClass("selected")
      resetJarSelect()
    }
  });

  $("#jar2").on("click", "p", function () {
    if (!selected1 && !selected3){
      selected2=true
      $(this).toggleClass("selected")}
      resetJarSelect();
  });

  $("#jar3").on("click", "p", function () {
    if (!selected2 && !selected1){
      selected3=true
      $(this).toggleClass("selected")
    resetJarSelect()
  };
  });

  //Steal button
  // --turn over, hide cookies, change player, check if game over
  $("button").on("click", function () {
    // wrapping all in a conditional that ensures at least 1 cookie is selected
    if ($(".cookie").hasClass("selected")){
    //hides cookies and removes selected class from cookies
    $(".selected").addClass("hidden");
    $(".selected").removeClass("selected");
    //changes active player and banner
    player == 1 ? player++ : player--;
    $("#playerBanner").text(`Player ${player}`);
    $(".wrapper").toggleClass("wrapper2")

    // resets jar selected so all are choosable
    selected1=false
    selected2=false
    selected3=false

    //establishes empty jars--- if all 3 empty it's game over
    if (
      $("#11").hasClass("hidden") &&
      $("#12").hasClass("hidden") &&
      $("#13").hasClass("hidden")
    ) {
      empty1 = true;
    }
    if (
      $("#21").hasClass("hidden") &&
      $("#22").hasClass("hidden") &&
      $("#23").hasClass("hidden") &&
      $("#24").hasClass("hidden") &&
      $("#25").hasClass("hidden")
    ) {
      empty2 = true;
    }
    if (
      $("#31").hasClass("hidden") &&
      $("#32").hasClass("hidden") &&
      $("#33").hasClass("hidden") &&
      $("#34").hasClass("hidden") &&
      $("#35").hasClass("hidden") &&
      $("#36").hasClass("hidden") &&
      $("#37").hasClass("hidden")
    ) {
      empty3 = true;
    }
    //all 3 empty--run game over function
    if (empty1 && empty2 && empty3) {
      gameOver = true;
    }
    isGameOver();
    }
    else alert(`Player ${player} can't resist, they must steal at least one cookie...`)
  });

  // what to do when game is over
  //remove player banner and displayer the display the loser!
  function isGameOver() {
    if (gameOver) {
      // done button increments player---so decrement back to display loser
      player == 1 ? player++ : player--;
      $("#playerBanner").toggleClass("hidden");
      $("#finished").text(
        `Player ${player} was caught...at least you got cookies!`
      );
      $("#finished").toggleClass("hidden");
    }
  }
});
