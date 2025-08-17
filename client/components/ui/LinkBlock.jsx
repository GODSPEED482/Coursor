const LinkBlock = ({ links }) => {
  return (
    <div className="p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-2xl font-semibold mb-2">Reference Website</h2>
      {/* {console.log(links)} */}
      {Array.isArray(links) && links.map((link, idx) => (
        <a
          key={idx}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block m-2 text-zinc-200  hover:text-green-500 transition"
        >
          {link}
        </a>
      ))}
    </div>
  );
};
export default LinkBlock;