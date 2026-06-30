interface ProjectNameInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ProjectNameInput({
  id = 'project-name',
  value,
  onChange,
}: ProjectNameInputProps) {
  return (
    <div className="calc-field project-name-field">
      <label htmlFor={id}>Project Name</label>
      <input
        id={id}
        type="text"
        className="project-name-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter project name"
      />
    </div>
  );
}
