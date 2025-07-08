type Axis = "horizontal" | "vertical";

type Props = {
  value: {
    horizontal: "collective" | "neoliberal";
    vertical: "progressive" | "authoritative";
  };
  onChange: (newValue: {
    horizontal: "collective" | "neoliberal";
    vertical: "progressive" | "authoritative";
  }) => void;
};

const SliderPanel = ({ value, onChange }: Props) => {
  const handleAxisChange = (axis: Axis, direction: string) => {
    onChange({
      ...value,
      [axis]: direction,
    } as Props["value"]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        marginTop: "2rem",
      }}
    >
      <div>
        <label>Economic Axis (Collective - Neoliberal):</label>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          {(["collective", "neoliberal"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => handleAxisChange("horizontal", dir)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: value.horizontal === dir ? "#222" : "#ccc",
                color: value.horizontal === dir ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label>Social Axis (Progressive - Authoritative):</label>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          {(["progressive", "authoritative"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => handleAxisChange("vertical", dir)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: value.vertical === dir ? "#222" : "#ccc",
                color: value.vertical === dir ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SliderPanel;