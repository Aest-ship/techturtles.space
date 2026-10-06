/* MAIN: starts everything once the page is ready. */
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("steps")) TT.render.steps();
  if (document.getElementById("resources")) TT.render.resources();
  TT.auth.init();
  TT.auth.onChange(function () {
    if (document.getElementById("grid")) TT.render.showcase();
  });
  TT.form.init();
  if (document.getElementById("grid")) TT.render.showcase();
});
