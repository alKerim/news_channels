type Axis = "horizontal" | "vertical";
type Direction = "left" | "right" | "conservative" | "progressive";

type Props = {
  value: {
    horizontal: "left" | "right";
    vertical: "conservative" | "progressive";
  };
  onChange: (newValue: {
    horizontal: "left" | "right";
    vertical: "conservative" | "progressive";
  }) => void;
};

const SliderPanel = ({ value, onChange }: Props) => {
  const handleAxisChange = (axis: Axis, direction: Direction) => {
    onChange({
      ...value,
      [axis]: direction,
    } as any);
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
        <label>Economic Axis (Kollective - Neoliberal):</label>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          {["kollective", "neutral", "neuliberal"].map((dir) => (
            <button
              key={dir}
              onClick={() => handleAxisChange("horizontal", dir as any)}
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
        <label>Social Axis (Progressive - Authorative):</label>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          {["progressive", "authorative"].map((dir) => (
            <button
              key={dir}
              onClick={() => handleAxisChange("vertical", dir as any)}
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
