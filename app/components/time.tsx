import { parseISO8601Duration, prettyPrintDuration } from "~/utils/time";
export const Time = ({
  label,
  time,
}: {
  label: string;
  time: string | null;
}) => {
  const parsedTime = parseISO8601Duration(time);
  const parts = prettyPrintDuration(parsedTime);

  if (parts.length === 0) {
    return <></>;
  }
  return (
    <div className="flex flex-col">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg">{parts}</div>
    </div>
  );
};
