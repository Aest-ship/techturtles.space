/* RENDER: turns data into HTML on the page. */
(function () {
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  TT.render = {
    steps: function () {
      document.getElementById("steps").innerHTML = TT.steps.map(function (s) {
        return "<li><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></li>";
      }).join("");
    },

    resources: function () {
      document.getElementById("resources").innerHTML = TT.resources.map(function (r) {
        return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
               '<span class="tag">' + esc(r.tag) + "</span>" +
               "<h3>" + esc(r.title) + "</h3><span>" + esc(r.text) + "</span></a>";
      }).join("");
    },

    card: function (p, isExample) {
      var footer, gallery = "";
      if (p.imageUrls && p.imageUrls.length) {
        gallery = '<div class="gallery">' + p.imageUrls.map(function (url, index) {
          return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' +
                 '<img src="' + esc(url) + '" alt="' + esc(p.title) + ' photo ' + (index + 1) + '" loading="lazy"></a>';
        }).join("") + "</div>";
      }
      if (isExample) {
        footer = "Example project";
      } else {
        footer = "By " + esc(p.who);
        if (p.fileUrl) {
          footer += ' · <a href="' + esc(p.fileUrl) + '" target="_blank" rel="noopener">Open document</a>';
        } else if (p.fileName) {
          footer += " · " + esc(p.fileName);
        }
        if (p.isOwner) {
          footer += '<br><button class="delete-post" type="button" data-post-id="' + esc(p.id) +
                    '" aria-label="Delete submission: ' + esc(p.title) + '" title="Delete submission">' +
                    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
                    '<path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"></path></svg></button>';
        }
      }
      return '<article class="card">' +
             (gallery || '<div class="pic" aria-hidden="true">' + (TT.kindIcons[p.kind] || "💡") + "</div>") +
             '<div class="body"><span class="tag">' + esc(p.kind) + "</span>" +
             (p.pending ? ' <span class="tag pending">Waiting for review</span>' : "") +
             "<h3>" + esc(p.title) + "</h3><p>" + esc(p.desc) + "</p>" +
             "<small>" + footer + "</small></div></article>";
    },

    showcase: function () {
      var grid = document.getElementById("grid");
      var status = document.getElementById("showcase-status");
      var examples = (TT.config.showExamples && TT.examples) ? TT.examples.map(function (p) { return TT.render.card(p, true); }) : [];


      if (!grid.dataset.deleteHandlerAttached) {
        grid.dataset.deleteHandlerAttached = "true";
        grid.addEventListener("click", function (event) {
          var button = event.target.closest(".delete-post");
          if (!button || !grid.contains(button)) return;
          if (!window.confirm("Delete this submission? This will permanently remove the post and its uploaded files.")) return;

          var id = button.getAttribute("data-post-id");
          button.disabled = true;
          status.textContent = "Deleting submission…";
          status.className = "note";
          TT.storage.remove(id).then(function () {
            status.textContent = "Your submission was deleted.";
            status.className = "ok";
            return TT.render.showcase();
          }).catch(function (err) {
            console.error(err);
            var filesNotRemoved = err && err.message === "post-deleted-files-not-removed";
            var deletePermissionMissing = err && err.message === "post-delete-not-allowed";
            status.textContent = filesNotRemoved
              ? "Your submission was deleted, but its uploaded files could not be removed. Please contact site support."
              : deletePermissionMissing
                ? "The database blocked this delete. Apply the owner-delete policies from SETUP.md in Supabase, then try again."
                : "We couldn't delete your submission. Please try again.";
            status.className = "err";
            if (filesNotRemoved) button.closest(".card").remove();
            else button.disabled = false;
          });
        });
      }

      return TT.storage.list().then(function (posts) {
        var html = posts.map(function (p) { return TT.render.card(p, false); }).concat(examples);
        grid.innerHTML = html.length ? html.join("") : "<p>No projects yet. Be the first to post one.</p>";
        if (new URLSearchParams(window.location.search).get("submitted") === "1") {
          status.textContent = TT.storage.live
            ? "Thanks! Your submission was received and will appear publicly after review."
            : "Posted. Your project is now in the showcase.";
          status.className = "ok";
        }
      }).catch(function (err) {
        console.error(err);
        grid.innerHTML = examples.join("") + "<p>We couldn't load community projects right now. Try again soon.</p>";
        status.textContent = "Community projects could not be loaded. Please try again soon.";
        status.className = "err";
      });
    }
  };
})();
