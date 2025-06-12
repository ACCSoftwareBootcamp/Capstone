$("document").ready(() => {
  let player = 1;
  let empty1 = false;
  let empty2 = false;
  let empty3 = false;
  let gameOver = false;

  let jar1 = $("#jar1");
  let jar2 = $("#jar2");
  let jar3 = $("#jar3");
  let c11 = $("#11");
  let c12 = $("#12");
  let c13 = $("#13");
  let c21 = $("#21");
  let c22 = $("#22");
  let c23 = $("#23");
  let c24 = $("#24");
  let c25 = $("#25");
  let c31 = $("#31");
  let c32 = $("#32");
  let c33 = $("#33");
  let c34 = $("#34");
  let c35 = $("#35");
  let c36 = $("#36");
  let c37 = $("#37");

  // let jar1Contents = [cookie11, cookie12, cookie13]
  // let jar2Contents = [cookie21, cookie22, cookie23, cookie24, cookie25]
  // let jar3Contents = [cookie31, cookie32, cookie33, cookie34, cookie35, cookie36, cookie37]

  function isGameOver() {
    if (gameOver) {
      player == 1 ? player++ : player--;
      $("#playerBanner").toggleClass("hidden");
      $("#finished").text(
        `Player ${player} is the loser that took the last one`
      );
      $("#finished").toggleClass("hidden");
    }
  }

  $("#playerBanner").text(`Player ${player}'s turn`);

  $(".jar").on("click", "p", function () {
    $(this).toggleClass("hidden");
  });

  $("button").on("click", function () {
    console.log(player);
    player == 1 ? player++ : player--;
    $("#playerBanner").text(`Player ${player}`);
    if (
      c11.hasClass("hidden") &&
      c12.hasClass("hidden") &&
      c13.hasClass("hidden")
    ) {
      empty1 = true;
    }
    if (
      c21.hasClass("hidden") &&
      c22.hasClass("hidden") &&
      c23.hasClass("hidden") &&
      c24.hasClass("hidden") &&
      c25.hasClass("hidden")
    ) {
      empty2 = true;
    }
    if (
      c31.hasClass("hidden") &&
      c32.hasClass("hidden") &&
      c33.hasClass("hidden") &&
      c34.hasClass("hidden") &&
      c35.hasClass("hidden") &&
      c36.hasClass("hidden") &&
      c37.hasClass("hidden")
    ) {
      empty3 = true;
    }
    if (empty1 && empty2 && empty3) {
      gameOver = true;
    }
    isGameOver();
  });
});
