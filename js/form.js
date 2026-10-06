/* FORM: handles the "Post your invention" form. */
(function () {
  function checkFile(file, types, description) {
    if (!file) return "";
    var ext = file.name.split(".").pop().toLowerCase();
    if (!types[ext] || (file.type && file.type !== types[ext])) return "Please choose a " + description + ".";
    if (!file.size) return "The selected file is empty.";
    if (file.size > TT.config.maxFileMB * 1024 * 1024) return "That file is too big. The limit is " + TT.config.maxFileMB + " MB.";
    return "";
  }

  TT.form = {
    init: function () {
      var form = document.getElementById("post-form");
      if (!form) return;
      var status = document.getElementById("post-status");
      var button = form.querySelector("button[type=submit]");
      var note = document.getElementById("post-note");

      note.textContent = TT.storage.live
        ? "Every post is reviewed before it appears publicly."
        : "Demo mode: post details are saved in this browser, but photo previews last only until you close or reload the tab. Connect Supabase in js/config.js to go live.";

      function say(msg, isError) { status.textContent = msg; status.className = isError ? "err" : "ok"; }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var data = new FormData(form);
        var file = data.get("doc");
        file = file && file.name ? file : null;
        var images = data.getAll("images").filter(function (image) { return image && image.name; });
        var emailInput = form.elements.contact_email;
        emailInput.value = emailInput.value.trim();

        var problem = images.length ? "" : "Please upload at least one project photo.";
        images.some(function (image) {
          problem = problem || checkFile(image, TT.config.imageTypes, "a JPG, PNG or WebP image");
          return !!problem;
        });
        problem = problem || checkFile(file, TT.config.fileTypes, "a PDF, DOC or DOCX file");
        if (!problem && !emailInput.checkValidity()) problem = "Please enter a valid contact email.";
        if (problem) { say(problem, true); return; }

        button.disabled = true;
        say("Posting…");

        TT.storage.add({
          title: data.get("title").trim(),
          who:   data.get("who").trim(),
          kind:  data.get("kind"),
          desc:  data.get("desc").trim(),
          contactEmail: emailInput.value
        }, file, images).then(function () {
          window.location.href = "showcase.html?submitted=1";
        }).catch(function (err) {
          console.error(err);
          say(err && err.message === "not-signed-in"
            ? "Please sign in first."
            : "Something went wrong and your post wasn't saved. Please try again.", true);
        }).then(function () { button.disabled = false; });
      });
    }
  };
})();
