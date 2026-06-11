import Models from "./Models";

interface ModelsDropdownContentProps {
  selectedModel: {
    company: string;
    modelName: string;
  };
  setSelectedModel: React.Dispatch<
    React.SetStateAction<{
      company: string;
      modelName: string;
    }>
  >;
}

export const ModelsDropdownContent = ({
  selectedModel,
  setSelectedModel,
}: ModelsDropdownContentProps) => {
  return (
    <div className="outline-none focus:outline-none ring-0 focus:ring-0">
      <Models
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
};