interface GradeGridProps {
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
  gradingScale: '4.0' | '5.0' | '10.0';
}

const GradeGrid = ({ selectedGrade, onSelectGrade, gradingScale }: GradeGridProps) => {
  const grades = {
    "10.0": ["O", "A+", "A", "B+", "B", "C", "D", "F"],
    "4.0": ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"],
    "5.0": ["A", "B", "C", "D", "F"],
  };

  const currentGrades = grades[gradingScale];

  return (
    <div className="grid grid-cols-4 gap-2">
      {currentGrades.map((grade) => (
        <button
          key={grade}
          type="button"
          onClick={() => onSelectGrade(grade)}
          className={`h-12 rounded-xl font-bold text-lg transition-all
                      ${selectedGrade === grade
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
        >
          {grade}
        </button>
      ))}
    </div>
  );
};

export default GradeGrid;
