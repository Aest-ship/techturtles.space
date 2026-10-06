/* STORAGE: where posts live.
   - Live mode (config.js has Supabase keys): posts go to Supabase, files to the storage bucket.
   - Demo mode (no keys): posts are kept in this browser only.
   The rest of the site only calls TT.storage.list() and TT.storage.add(). Both return Promises. */
(function () {
  var cfg = TT.config;
  var live = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  var client = live ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  var KEY = "tt_posts";
  var demoImageUrls = {};

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function extOf(name) { return String(name).split(".").pop().toLowerCase(); }

  /* ---- demo mode ---- */
  function listDemo() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]").map(function (post) {
        post.imageUrls = demoImageUrls[post.id] || [];
        post.isOwner = true;
        return post;
      });
    } catch (e) { return []; }
  }
  function addDemo(post, file, images) {
    var posts = listDemo();
    var id = uuid();
    demoImageUrls[id] = images.map(function (image) { return URL.createObjectURL(image); });
    posts.unshift({ id: id, title: post.title, who: post.who, kind: post.kind, desc: post.desc,
                    contactEmail: post.contactEmail, imageUrls: demoImageUrls[id],
                    fileName: file ? file.name : "", fileUrl: "", pending: false });
    try { localStorage.setItem(KEY, JSON.stringify(posts)); } catch (e) {}
  }

  /* ---- live mode ---- */
  function listLive() {
    return Promise.all([
      client.auth.getSession(),
      client.from("posts")
        .select("id,created_at,user_id,title,author_name,kind,description,image_paths,file_path,file_name,approved")
        .order("created_at", { ascending: false })
    ]).then(function (results) {
      var sessionResult = results[0], postsResult = results[1];
      if (sessionResult.error) throw sessionResult.error;
      if (postsResult.error) throw postsResult.error;
      var userId = sessionResult.data.session && sessionResult.data.session.user.id;
      return postsResult.data.map(function (row) {
        var url = row.file_path ? client.storage.from(cfg.bucket).getPublicUrl(row.file_path).data.publicUrl : "";
        var imageUrls = Array.isArray(row.image_paths)
          ? row.image_paths.map(function (path) { return client.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl; })
          : [];
        return { id: row.id, isOwner: !!userId && row.user_id === userId,
                 title: row.title, who: row.author_name, kind: row.kind, desc: row.description,
                 imageUrls: imageUrls, fileName: row.file_name || "", fileUrl: url, pending: !row.approved };
      });
    });
  }

  function removeDemo(id) {
    var posts = listDemo();
    var remaining = posts.filter(function (post) { return post.id !== id; });
    if (remaining.length === posts.length) throw new Error("post-not-found");
    localStorage.setItem(KEY, JSON.stringify(remaining));
    (demoImageUrls[id] || []).forEach(function (url) { URL.revokeObjectURL(url); });
    delete demoImageUrls[id];
  }

  function removeLive(id) {
    return client.from("posts")
      .delete()
      .eq("id", id)
      .select("id,file_path,image_paths")
      .then(function (result) {
        if (result.error) throw result.error;
        if (!result.data || !result.data.length) throw new Error("post-delete-not-allowed");
        var paths = result.data.reduce(function (all, post) {
          if (post.file_path) all.push(post.file_path);
          if (Array.isArray(post.image_paths)) all = all.concat(post.image_paths);
          return all;
        }, []);
        if (!paths.length) return;
        return client.storage.from(cfg.bucket).remove(paths).then(function (removed) {
          if (removed.error) {
            console.error("Submission was deleted, but its uploaded files could not be removed.", removed.error);
            throw new Error("post-deleted-files-not-removed");
          }
        });
      });
  }

  function addLive(post, file, images) {
    return client.auth.getSession().then(function (r) {
      var session = r.data && r.data.session;
      if (!session) throw new Error("not-signed-in");
      var uid = session.user.id;

      var uploaded = Promise.resolve(null);
      if (file) {
        var ext = extOf(file.name);
        var path = uid + "/" + uuid() + "." + ext;
        uploaded = client.storage.from(cfg.bucket)
          .upload(path, file, { contentType: cfg.fileTypes[ext], upsert: false })
          .then(function (u) { if (u.error) throw u.error; return path; });
      }

      var uploadedImages = Promise.all(images.map(function (image) {
        var ext = extOf(image.name);
        var path = uid + "/" + uuid() + "." + ext;
        return client.storage.from(cfg.bucket)
          .upload(path, image, { contentType: cfg.imageTypes[ext], upsert: false })
          .then(function (u) { if (u.error) throw u.error; return path; });
      }));

      return Promise.all([uploaded, uploadedImages]).then(function (results) {
        return Promise.resolve(client.from("posts").insert({
          user_id: uid,
          title: post.title,
          author_name: post.who,
          kind: post.kind,
          description: post.desc,
          contact_email: post.contactEmail,
          image_paths: results[1],
          file_path: results[0],
          file_name: file ? file.name.slice(0, 200) : null
        })).then(function (i) { if (i.error) throw i.error; });
      });
    });
  }

  TT.storage = {
    live: live,
    client: client,
    list: function () { return live ? listLive() : Promise.resolve(listDemo()); },
    add:  function (post, file, images) { return live ? addLive(post, file, images) : Promise.resolve(addDemo(post, file, images)); },
    remove: function (id) {
      return live ? removeLive(id) : Promise.resolve().then(function () { removeDemo(id); });
    }
  };
})();
