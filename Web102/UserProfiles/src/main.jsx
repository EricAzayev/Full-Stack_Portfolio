import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./routes/Layout.jsx";
import ProfileEdit from "./routes/ProfileEdit.jsx";
import ProfileCreate from "./routes/ProfileCreate.jsx";
import NotFound from "./routes/NotFound.jsx";
import CreatePost from "./routes/CreatePost.jsx";
import EditPost from "./routes/EditPost.jsx";
import PostDiscussion from "./routes/PostDiscussion.jsx";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index={true} element={<App />} />
          <Route index={false} path="/edit/:id" element={<ProfileEdit />} />

          <Route index={false} path="/create-post" element={<CreatePost />} />
          <Route
            index={false}
            path="/discussions/:id"
            element={<PostDiscussion />}
          />

          <Route index={false} path="/edit-post/:id" element={<EditPost />} />

          <Route index={false} path="/create" element={<ProfileCreate />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
