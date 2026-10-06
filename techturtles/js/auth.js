/* AUTH: email sign-in with a magic link (no passwords).
   Only active in live mode. Signed-out visitors can read the showcase but not post. */
(function () {
  var listeners = [];

  function setStatus(msg, isError) {
    var el = document.getElementById("auth-status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = isError ? "err" : "ok";
  }

  TT.auth = {
    user: null,

    onChange: function (fn) { listeners.push(fn); },

    init: function () {
      var box = document.getElementById("auth-box");
      var fields = document.getElementById("post-fields");
      var c = TT.storage.client;
      if (!box) return;
      if (!c) { box.hidden = true; return; }   // demo mode: no sign-in needed

      box.hidden = false;
      var msg = document.getElementById("auth-msg");
      var signinForm = document.getElementById("signin-form");
      var signoutBtn = document.getElementById("signout-btn");

      function paint() {
        var u = TT.auth.user;
        if (fields) fields.disabled = !u;
        if (signinForm) signinForm.hidden = !!u;
        if (signoutBtn) signoutBtn.hidden = !u;
        if (msg) msg.textContent = u
          ? "Signed in as " + u.email + "."
          : "Sign in with your email to post or manage your submissions.";
      }

      if (signinForm) {
        signinForm.addEventListener("submit", function (e) {
          e.preventDefault();
          var email = new FormData(signinForm).get("email");
          setStatus("Sending link…");
          c.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + location.pathname } })
            .then(function (r) {
              if (r.error) throw r.error;
              setStatus("Check your email and open the link to finish signing in.");
            })
            .catch(function (err) {
              console.error(err);
              setStatus("Couldn't send the link. Check the email address and try again.", true);
            });
        });
      }

      if (signoutBtn) {
        signoutBtn.addEventListener("click", function () {
          c.auth.signOut().then(function (r) {
            if (r.error) throw r.error;
            setStatus("");
          }).catch(function (err) {
            console.error(err);
            setStatus("Couldn't sign out. Please try again.", true);
          });
        });
      }

      c.auth.onAuthStateChange(function (event, session) {
        TT.auth.user = session ? session.user : null;
        paint();
        listeners.forEach(function (fn) { fn(TT.auth.user); });
      });

      c.auth.getSession().then(function (r) {
        TT.auth.user = r.data.session ? r.data.session.user : null;
        paint();
      });
      paint();
    }
  };
})();
