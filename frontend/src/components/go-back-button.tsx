import { ArrowLeft } from "@mynaui/icons-react";

function GoBackButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 text-black border rounded-lg shadow transition duration-300 flex items-center hover:scale-105"
    >
      <ArrowLeft className="mr-2" />
      Върни се
    </button>
  );
}

export default GoBackButton;
