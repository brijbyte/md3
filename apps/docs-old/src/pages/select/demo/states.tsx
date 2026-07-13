import "./states.css";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@brijbyte/md3-react/select";

const STATES = [
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
];

function StateSelect(props: {
  error?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  supportingText: string;
}) {
  const { supportingText, ...rest } = props;
  return (
    <Select variant="outlined" items={STATES} {...rest}>
      <SelectTrigger label="State" supportingText={supportingText} />
      <SelectContent>
        {STATES.map((state) => (
          <SelectItem key={state.value} value={state.value}>
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function SelectStatesDemo() {
  return (
    <div className="demo-select-states">
      <StateSelect supportingText="Where you currently live" />
      <StateSelect error supportingText="A state is required" />
      <StateSelect disabled defaultValue="CA" supportingText="Can't change this" />
    </div>
  );
}
