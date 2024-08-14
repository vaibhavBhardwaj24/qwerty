import React from "react";

import "react-quill/dist/quill.snow.css";

const HTMLRenderer = ({ htmlString }: { htmlString: string }) => {
  return (
    <div className="h-fit">
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: htmlString }}
      />
    </div>
  );
};

export default HTMLRenderer;
