import { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { FiMinus, FiPlus } from "react-icons/fi";

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? "bg-blue-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export const Grade = () => {
  const [maxScore, setMaxScore] = useState<5 | 10>(5);
  const [customScore, setCustomScore] = useState(5);

  const [allowPastDates, setAllowPastDates] = useState(false);
  const [allowNonTeaching, setAllowNonTeaching] = useState(false);
  const [showCenterRating, setShowCenterRating] = useState(false);
  const [showBranchRating, setShowBranchRating] = useState(false);

  const handleDecrement = () => {
    setCustomScore((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setCustomScore((prev) => prev + 1);
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1) setCustomScore(val);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold text-ink mb-4">Grade</h1>

      <div className="bg-surface rounded-xl shadow-sm p-6 max-w-4xl">
        {/* Attention Banner */}
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <BsCheckCircleFill className="text-green-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="text-green-700 font-semibold text-sm">Attention!</p>
            <p className="text-green-700 text-sm mt-0.5">
              After the grading system is introduced, if the maximum score is
              changed, all previous grades will be deleted.
            </p>
          </div>
        </div>

        {/* Maximum Score */}
        <div className="mb-6">
          <p className="text-sm text-body mb-2">Maximum score</p>
          <div className="flex items-center gap-2">
            {/* Preset Buttons */}
            <button
              onClick={() => setMaxScore(5)}
              className={`w-12 h-10 rounded-md text-sm font-medium transition-colors ${
                maxScore === 5
                  ? "bg-blue-500 text-white"
                  : "bg-surface border border-line text-body hover:bg-surface2"
              }`}
            >
              5
            </button>
            <button
              onClick={() => setMaxScore(10)}
              className={`w-12 h-10 rounded-md text-sm font-medium transition-colors ${
                maxScore === 10
                  ? "bg-blue-500 text-white"
                  : "bg-surface border border-line text-body hover:bg-surface2"
              }`}
            >
              10
            </button>

            {/* Custom Score Stepper */}
            <div className="flex items-center border border-line rounded-md overflow-hidden ml-1">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center text-muted hover:bg-surface2 transition-colors border-r border-line"
              >
                <FiMinus size={16} />
              </button>
              <input
                type="number"
                value={customScore}
                onChange={handleCustomInput}
                className="w-14 h-10 text-center text-sm text-body focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center text-muted hover:bg-surface2 transition-colors border-l border-line"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-5 mb-8">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-body">
              Allow editing grades for past dates
            </span>
            <Toggle
              checked={allowPastDates}
              onChange={() => setAllowPastDates((p) => !p)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-body">
              Allow non-teaching staff to give grades
            </span>
            <Toggle
              checked={allowNonTeaching}
              onChange={() => setAllowNonTeaching((p) => !p)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-body">
              Show center-wide rating in student profile
            </span>
            <Toggle
              checked={showCenterRating}
              onChange={() => setShowCenterRating((p) => !p)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-body">
              Show branch-wide rating in student profile
            </span>
            <Toggle
              checked={showBranchRating}
              onChange={() => setShowBranchRating((p) => !p)}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 rounded-md text-sm font-medium transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};