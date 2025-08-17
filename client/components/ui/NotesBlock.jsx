import ReactMarkdown from "react-markdown";

const NotesBlock = ({ notes }) => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-6">Notes</h2>

    <div className="text-lg leading-relaxed space-y-4">
      <ReactMarkdown
        components={{
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold mt-5 mb-2 underline" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold underline mt-5 mb-2" {...props} />
          ), 
          strong: ({ node, ...props }) => (
            <strong className="text-xl font-semibold underline mt-5 mb-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-white/80 p-3" {...props} />
          ),
        code: ({ node, ...props }) => (
          <code className="text-white/90 bg-zinc-800 text-sm rounded  p-1 font-mono" {...props} />
        ),
          p: ({ node, ...props }) => (
            <p className="text-white/80 p-3" {...props} />
          )
        }}
      >
        {notes}
      </ReactMarkdown>
    </div>
  </div>
);

export default NotesBlock;
