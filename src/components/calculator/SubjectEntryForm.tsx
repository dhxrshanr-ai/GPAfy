import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useGPAStore } from "@/store/useGPAStore";
import { COMMON_SUBJECTS } from "@/data/common-courses";
import GradeGrid from "./GradeGrid";

export const SubjectEntryForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { addSubject, gradingScale } = useGPAStore();
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: 3,
    grade: "",
  });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete suggestions
  const suggestions = COMMON_SUBJECTS.filter((subject) =>
    subject.code.toLowerCase().includes(formData.code.toLowerCase()) ||
    subject.name.toLowerCase().includes(formData.code.toLowerCase())
  );

  const handleSelectSuggestion = (suggestion: typeof COMMON_SUBJECTS[0]) => {
    setFormData({
      ...formData,
      code: suggestion.code,
      name: suggestion.name,
      credits: suggestion.credits,
    });
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.grade) {
      return;
    }

    addSubject({
      code: formData.code,
      name: formData.name || formData.code,
      credits: formData.credits,
      grade: formData.grade,
      semesterId: "", // Will be set by store
    });

    onSuccess?.();

    // Reset form
    setFormData({
      code: "",
      name: "",
      credits: 3,
      grade: "",
    });
    
    // Focus back on code input
    codeInputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject Code */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Subject Code
        </label>
        <input
          ref={codeInputRef}
          type="text"
          value={formData.code}
          onChange={(e) => {
            setFormData({ ...formData, code: e.target.value });
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="e.g., CS335"
          className="w-full h-14 px-4 bg-gray-800 border border-gray-700 rounded-xl
                     text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
        />
        
        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && formData.code && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl
                          shadow-xl max-h-60 overflow-y-auto">
            {suggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion.code}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors
                           first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="font-semibold text-white">{suggestion.code}</div>
                <div className="text-sm text-gray-400">{suggestion.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subject Name */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Subject Name (Optional)
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Course Title"
          className="w-full h-14 px-4 bg-gray-800 border border-gray-700 rounded-xl
                     text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Credits */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Credits
        </label>
        <div className="flex gap-2 mb-3">
          {[1, 1.5, 2, 3, 4].map((credit) => (
            <button
              key={credit}
              type="button"
              onClick={() => setFormData({ ...formData, credits: credit })}
              className={`flex-1 h-12 rounded-xl font-bold text-lg transition-all
                          ${formData.credits === credit
                            ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/20'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
            >
              {credit}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={formData.credits}
          onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) || 0 })}
          min="0.5"
          max="10"
          step="0.5"
          className="w-full h-14 px-4 bg-gray-800 border border-gray-700 rounded-xl
                     text-white text-center text-lg font-semibold
                     focus:border-primary focus:outline-none"
        />
      </div>

      {/* Grade Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Grade
        </label>
        <GradeGrid
          selectedGrade={formData.grade}
          onSelectGrade={(grade) => setFormData({ ...formData, grade })}
          gradingScale={gradingScale}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!formData.code || !formData.grade}
        className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600
                   text-white font-semibold rounded-xl
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:shadow-lg hover:shadow-purple-500/50
                   active:scale-95 transition-all
                   flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Subject
      </button>
    </form>
  );
};
