/* CONFIG: the only file you must edit to connect the backend.
   Leave supabaseUrl empty to run in demo mode (posts saved only in the visitor's browser).

   The anon / publishable key is safe to put here: it is meant to be public, and the rules
   in sql/setup.sql control what it can do. NEVER paste the "service_role" / secret key here. */
window.TT = window.TT || {};

TT.config = {
  supabaseUrl: "https://qkgxyzbywmrhbzhzlpsh.supabase.co",        // e.g. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "sb_publishable_2OhtSoQi5wWPqoQd7-TEJg_BEYfW8JY",    // Project Settings → API → anon / publishable key
  bucket: "papers",       // storage bucket name created by sql/setup.sql

  maxFileMB: 5,           // keep in sync with file_size_limit in sql/setup.sql
  fileTypes: {            // allowed uploads: extension → MIME type (keep in sync with sql/setup.sql)
    pdf:  "application/pdf",
    doc:  "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "application/notepad"
  },
  imageTypes: {           // allowed project photos (keep in sync with sql/setup.sql)
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
    webp: "image/webp"
  },

  showExamples: true      // set to false once real posts exist
};
