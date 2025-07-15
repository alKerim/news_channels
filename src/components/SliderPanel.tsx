type Props = {
  value: {
    horizontal: "collective" | "neutral" | "neoliberal";
    vertical: "progressive" | "authoritative";
  };
  onChange: (newValue: {
    horizontal: "collective" | "neutral" | "neoliberal";
    vertical: "progressive" | "authoritative";
  }) => void;
  onCommit?: (newValue: {
    horizontal: "collective" | "neutral" | "neoliberal";
    vertical: "progressive" | "authoritative";
  }) => void;
};

const SliderPanel = ({ value, onChange, onCommit }: Props) => {
  const handleSliderChange = (
    axis: "horizontal" | "vertical",
    position: number
  ) => {
    let directionMap: string[];
    
    if (axis === "horizontal") {
      directionMap = ["collective", "neutral", "neoliberal"];
    } else {
      directionMap = ["progressive", "authoritative"];
    }

    const newValue = {
      ...value,
      [axis]: directionMap[position] as
        | "collective"
        | "neutral"
        | "neoliberal"
        | "progressive"
        | "authoritative",
    };

    onChange(newValue);
  };

  const handleSliderCommit = (
    axis: "horizontal" | "vertical",
    position: number
  ) => {
    if (!onCommit) return;
    
    let directionMap: string[];
    
    if (axis === "horizontal") {
      directionMap = ["collective", "neutral", "neoliberal"];
    } else {
      directionMap = ["progressive", "authoritative"];
    }

    const newValue = {
      ...value,
      [axis]: directionMap[position] as
        | "collective"
        | "neutral"
        | "neoliberal"
        | "progressive"
        | "authoritative",
    };

    onCommit(newValue);
  };

  const SliderControl = ({
    leftLabel,
    middleLabel,
    rightLabel,
    value,
    onChange,
    onCommit,
    color = "#2563eb",
    isThreePosition = false,
  }: {
    leftLabel: string;
    middleLabel?: string;
    rightLabel: string;
    value: number;
    onChange: (val: number) => void;
    onCommit?: (val: number) => void;
    color?: string;
    isThreePosition?: boolean;
  }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <span style={{ fontWeight: value === 0 ? "600" : "400", color: value === 0 ? "#1f2937" : "#6b7280" }}>
          {leftLabel}
        </span>
        {isThreePosition && middleLabel && (
          <span style={{ fontWeight: value === 1 ? "600" : "400", color: value === 1 ? "#1f2937" : "#6b7280" }}>
            {middleLabel}
          </span>
        )}
        <span style={{ fontWeight: value === (isThreePosition ? 2 : 1) ? "600" : "400", color: value === (isThreePosition ? 2 : 1) ? "#1f2937" : "#6b7280" }}>
          {rightLabel}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={isThreePosition ? 2 : 1}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        onMouseUp={(e) => onCommit?.(parseInt(e.currentTarget.value))}
        onKeyUp={(e) => onCommit?.(parseInt(e.currentTarget.value))}
        style={{
          width: "100%",
          accentColor: color,
          cursor: "pointer",
        }}
      />
    </div>
  );

  const getHorizontalValue = () => {
    switch (value.horizontal) {
      case "collective": return 0;
      case "neutral": return 1;
      case "neoliberal": return 2;
      default: return 0;
    }
  };

  return (
    <div
      style={{
        width: "50%", // Set the width
        margin: "0 auto",
        marginTop: "2rem",
        padding: "2rem",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div style={{ width: "100%" }}>
          <label
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Economic Axis
          </label>
          <SliderControl
            leftLabel="Collective"
            middleLabel="Neutral"
            rightLabel="Neoliberal"
            value={getHorizontalValue()}
            onChange={(val) => handleSliderChange("horizontal", val)}
            onCommit={(val) => handleSliderCommit("horizontal", val)}
            color="#dc2626"
            isThreePosition={true}
          />
        </div>

        <div style={{ width: "100%" }}>
          <label
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Social Axis
          </label>
          <SliderControl
            leftLabel="Progressive"
            rightLabel="Authoritative"
            value={value.vertical === "progressive" ? 0 : 1}
            onChange={(val) => handleSliderChange("vertical", val)}
            onCommit={(val) => handleSliderCommit("vertical", val)}
            color="#7c3aed"
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.8rem",
            color: "#6b7280",
            marginBottom: "0.5rem",
          }}
        >
          Current Perspective
        </div>
        <div
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#1f2937",
            textTransform: "capitalize",
          }}
        >
          {value.horizontal} + {value.vertical}
        </div>
      </div>
    </div>
  );
};

export default SliderPanel;
