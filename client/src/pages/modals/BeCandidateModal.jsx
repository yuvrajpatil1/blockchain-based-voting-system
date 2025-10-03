import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  CheckCircle,
  AlertCircle,
  Crown,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Award,
  Calendar,
  Plus,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  GraduationCap,
  Briefcase,
  Trophy,
  Globe,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import { RegisterCandidate } from "../../apicalls/candidates";
import { GetAllElections } from "../../apicalls/admin";
import { showLoading, hideLoading } from "../../redux/loaderSlice";

function BeCandidateModal({
  showBeCandidateModal,
  setShowBeCandidateModal,
  reloadData,
}) {
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    party: "",
    position: "",
    biography: "",
    manifesto: "",
    transactionPin: "",
    experience: [
      { title: "", organization: "", duration: "", description: "" },
    ],
    education: [{ degree: "", institution: "", year: "" }],
    achievements: [{ title: "", description: "", year: "" }],
    socialMedia: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      website: "",
    },
    electionId: "", // Added missing electionId
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elections, setElections] = useState([]);

  const positions = [
    "President",
    "Vice President",
    "Governor",
    "Senator",
    "Representative",
    "Mayor",
    "Council Member",
    "Other",
  ];

  const popularParties = [
    "Independent",
    "Democratic Party",
    "Republican Party",
    "Green Party",
    "Libertarian Party",
    "Socialist Party",
    "Other",
  ];

  const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Political Details", icon: Crown },
    { id: 3, title: "Background", icon: Briefcase },
    { id: 4, title: "Social Media", icon: Globe },
    { id: 5, title: "Confirmation", icon: CheckCircle },
  ];

  // Fetch available elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await GetAllElections();
        if (response.success) {
          // Filter elections that are in scheduled status (accepting candidates)
          const scheduledElections = response.data.filter(
            (e) => e.status === "scheduled"
          );
          setElections(scheduledElections);
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
      }
    };

    if (showBeCandidateModal) {
      fetchElections();
    }
  }, [showBeCandidateModal]);

  // Initialize form data with user data when modal opens
  useEffect(() => {
    if (showBeCandidateModal && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        contactNo: user.contactNo || "",
      }));
    }
  }, [showBeCandidateModal, user]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const updatedArray = [...formData[arrayName]];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      [arrayName]: updatedArray,
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      experience: {
        title: "",
        organization: "",
        duration: "",
        description: "",
      },
      education: { degree: "", institution: "", year: "" },
      achievements: { title: "", description: "", year: "" },
    };

    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    if (formData[arrayName].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          newErrors.firstName = "First name is required";
        } else if (formData.firstName.trim().length < 2) {
          newErrors.firstName = "First name must be at least 2 characters";
        }

        if (!formData.lastName.trim()) {
          newErrors.lastName = "Last name is required";
        } else if (formData.lastName.trim().length < 2) {
          newErrors.lastName = "Last name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }

        if (!formData.contactNo.trim()) {
          newErrors.contactNo = "Contact number is required";
        } else if (!/^\d{10}$/.test(formData.contactNo.replace(/\D/g, ""))) {
          newErrors.contactNo = "Please enter a valid 10-digit phone number";
        }
        break;

      case 2:
        if (!formData.party.trim()) {
          newErrors.party = "Party affiliation is required";
        }

        if (!formData.position.trim()) {
          newErrors.position = "Position is required";
        }

        if (!formData.biography.trim()) {
          newErrors.biography = "Biography is required";
        } else if (formData.biography.trim().length < 50) {
          newErrors.biography = "Biography must be at least 50 characters";
        } else if (formData.biography.length > 1000) {
          newErrors.biography = "Biography cannot exceed 1000 characters";
        }

        if (!formData.manifesto.trim()) {
          newErrors.manifesto = "Manifesto is required";
        } else if (formData.manifesto.trim().length < 100) {
          newErrors.manifesto = "Manifesto must be at least 100 characters";
        } else if (formData.manifesto.length > 2000) {
          newErrors.manifesto = "Manifesto cannot exceed 2000 characters";
        }
        break;

      case 3:
        // Background validation is optional, but if provided, validate format
        const hasValidExperience = formData.experience.some(
          (exp) => exp.title?.trim() && exp.organization?.trim()
        );
        const hasValidEducation = formData.education.some(
          (edu) => edu.degree?.trim() && edu.institution?.trim()
        );

        // At least one experience or education should be provided
        if (!hasValidExperience && !hasValidEducation) {
          newErrors.background =
            "Please provide at least one experience or education entry";
        }
        break;

      case 4:
        // Social media validation (optional fields but validate format if provided)
        if (
          formData.socialMedia.facebook &&
          !formData.socialMedia.facebook.includes("facebook.com")
        ) {
          newErrors.facebook = "Please enter a valid Facebook URL";
        }
        if (
          formData.socialMedia.linkedin &&
          !formData.socialMedia.linkedin.includes("linkedin.com")
        ) {
          newErrors.linkedin = "Please enter a valid LinkedIn URL";
        }
        if (
          formData.socialMedia.website &&
          !/^https?:\/\/.+/.test(formData.socialMedia.website)
        ) {
          newErrors.website =
            "Please enter a valid website URL (include http:// or https://)";
        }
        break;

      case 5:
        if (!formData.transactionPin.trim()) {
          newErrors.transactionPin = "Transaction PIN is required";
        } else if (formData.transactionPin.length < 4) {
          newErrors.transactionPin = "PIN must be at least 4 characters";
        } else if (formData.transactionPin.length > 10) {
          newErrors.transactionPin = "PIN cannot exceed 10 characters";
        }
        break;
    }

    return newErrors;
  };

  const nextStep = () => {
    const newErrors = validateStep(activeStep);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setActiveStep((prev) => Math.min(prev + 1, 5));
    } else {
      toast.warning("Please fix the errors before proceeding", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
    setErrors({}); // Clear errors when going back
  };

  const handleSubmit = async () => {
    const newErrors = validateStep(5);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix all errors before submitting", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(showLoading());

      // Clean and prepare data for submission
      const cleanedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        contactNo: formData.contactNo.replace(/\D/g, ""), // Only digits
        party: formData.party.trim(),
        position: formData.position.trim(),
        biography: formData.biography.trim(),
        manifesto: formData.manifesto.trim(),
        transactionPin: formData.transactionPin,

        // Filter out empty entries
        experience: formData.experience.filter(
          (exp) => exp.title?.trim() || exp.organization?.trim()
        ),
        education: formData.education.filter(
          (edu) => edu.degree?.trim() || edu.institution?.trim()
        ),
        achievements: formData.achievements.filter(
          (ach) => ach.title?.trim() || ach.description?.trim()
        ),

        // Clean social media URLs
        socialMedia: {
          twitter: formData.socialMedia.twitter?.trim() || "",
          facebook: formData.socialMedia.facebook?.trim() || "",
          instagram: formData.socialMedia.instagram?.trim() || "",
          linkedin: formData.socialMedia.linkedin?.trim() || "",
          website: formData.socialMedia.website?.trim() || "",
        },

        electionId: formData.electionId, // Include electionId if available
      };

      const response = await RegisterCandidate(cleanedData);

      if (response.success) {
        toast.success(
          "Candidate application submitted successfully! Awaiting admin approval.",
          {
            position: "top-right",
            autoClose: 5000,
            icon: "👑",
          }
        );
        handleClose();
        if (reloadData) reloadData();
      } else {
        throw new Error(response.message || "Application submission failed");
      }
    } catch (error) {
      console.error("Candidate registration error:", error);

      let errorMessage = "Application failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        icon: "❌",
      });
    } finally {
      setIsSubmitting(false);
      dispatch(hideLoading());
    }
  };

  const handleClose = () => {
    setShowBeCandidateModal(false);
    setActiveStep(1);
    setShowPin(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      contactNo: "",
      party: "",
      position: "",
      biography: "",
      manifesto: "",
      transactionPin: "",
      experience: [
        { title: "", organization: "", duration: "", description: "" },
      ],
      education: [{ degree: "", institution: "", year: "" }],
      achievements: [{ title: "", description: "", year: "" }],
      socialMedia: {
        twitter: "",
        facebook: "",
        instagram: "",
        linkedin: "",
        website: "",
      },
      electionId: "",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center">
              <User className="w-5 h-5 mr-2 text-amber-400" />
              Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  maxLength="50"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.firstName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  maxLength="50"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.lastName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-amber-400" />
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-amber-400" />
                Contact Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={formData.contactNo}
                onChange={(e) =>
                  handleInputChange(
                    "contactNo",
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter 10-digit contact number"
                maxLength="10"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.contactNo
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              {errors.contactNo && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.contactNo}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Enter digits only (e.g., 9876543210)
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center">
              <Crown className="w-5 h-5 mr-2 text-amber-400" />
              Political Information
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Building className="w-4 h-4 mr-2 text-amber-400" />
                Party Affiliation <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.party}
                onChange={(e) => handleInputChange("party", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.party
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              >
                <option value="">Select Party</option>
                {popularParties.map((party) => (
                  <option key={party} value={party}>
                    {party}
                  </option>
                ))}
              </select>
              {formData.party === "Other" && (
                <input
                  type="text"
                  placeholder="Enter party name"
                  onChange={(e) => handleInputChange("party", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors mt-2"
                  maxLength="100"
                />
              )}
              {errors.party && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.party}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Award className="w-4 h-4 mr-2 text-amber-400" />
                Position Seeking <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.position
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              >
                <option value="">Select Position</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {formData.position === "Other" && (
                <input
                  type="text"
                  placeholder="Enter position"
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors mt-2"
                  maxLength="100"
                />
              )}
              {errors.position && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.position}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Biography <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.biography}
                onChange={(e) => handleInputChange("biography", e.target.value)}
                placeholder="Tell voters about yourself, your background, and why you're running..."
                rows="4"
                maxLength="1000"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.biography
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              {errors.biography && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.biography}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {formData.biography.length}/1000 characters (minimum 50
                required)
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-amber-400" />
                Campaign Manifesto <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.manifesto}
                onChange={(e) => handleInputChange("manifesto", e.target.value)}
                placeholder="Outline your key policies, goals, and promises to voters..."
                rows="5"
                maxLength="2000"
                className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.manifesto
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-amber-500"
                }`}
              />
              {errors.manifesto && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.manifesto}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {formData.manifesto.length}/2000 characters (minimum 100
                required)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-amber-400" />
              Professional Background
            </h3>

            {errors.background && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.background}
                </p>
              </div>
            )}

            {/* Experience Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-amber-400" />
                  Work Experience
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem("experience")}
                  className="text-amber-400 hover:text-amber-300 text-sm flex items-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Experience
                </button>
              </div>

              {formData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="border border-gray-600 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Experience #{index + 1}
                    </span>
                    {formData.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("experience", index)}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Job Title"
                      maxLength="100"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={exp.organization}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          "organization",
                          e.target.value
                        )
                      }
                      placeholder="Organization"
                      maxLength="100"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) =>
                      handleArrayChange(
                        "experience",
                        index,
                        "duration",
                        e.target.value
                      )
                    }
                    placeholder="Duration (e.g., 2020-2023)"
                    maxLength="50"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleArrayChange(
                        "experience",
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Brief description of role and achievements..."
                    rows="2"
                    maxLength="500"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors resize-none"
                  />
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-amber-400" />
                  Education
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem("education")}
                  className="text-amber-400 hover:text-amber-300 text-sm flex items-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Education
                </button>
              </div>

              {formData.education.map((edu, index) => (
                <div
                  key={index}
                  className="border border-gray-600 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Education #{index + 1}
                    </span>
                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("education", index)}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        handleArrayChange(
                          "education",
                          index,
                          "degree",
                          e.target.value
                        )
                      }
                      placeholder="Degree/Qualification"
                      maxLength="100"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) =>
                        handleArrayChange(
                          "education",
                          index,
                          "year",
                          e.target.value
                        )
                      }
                      placeholder="Year"
                      maxLength="10"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      handleArrayChange(
                        "education",
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                    placeholder="Institution/University"
                    maxLength="100"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Achievements Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-amber-400" />
                  Achievements
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem("achievements")}
                  className="text-amber-400 hover:text-amber-300 text-sm flex items-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Achievement
                </button>
              </div>

              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="border border-gray-600 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Achievement #{index + 1}
                    </span>
                    {formData.achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("achievements", index)}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={achievement.title}
                      onChange={(e) =>
                        handleArrayChange(
                          "achievements",
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Achievement Title"
                      maxLength="100"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={achievement.year}
                      onChange={(e) =>
                        handleArrayChange(
                          "achievements",
                          index,
                          "year",
                          e.target.value
                        )
                      }
                      placeholder="Year"
                      maxLength="10"
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                    />
                  </div>
                  <textarea
                    value={achievement.description}
                    onChange={(e) =>
                      handleArrayChange(
                        "achievements",
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Description of achievement..."
                    rows="2"
                    maxLength="500"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-amber-400" />
              Social Media & Online Presence
            </h3>
            <p className="text-sm text-gray-400">
              Connect with voters through your online presence (all fields are
              optional)
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                  Twitter/X Handle
                </label>
                <input
                  type="text"
                  value={formData.socialMedia.twitter}
                  onChange={(e) =>
                    handleInputChange("socialMedia.twitter", e.target.value)
                  }
                  placeholder="@yourusername or full URL"
                  maxLength="100"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                  Facebook Profile/Page
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) =>
                    handleInputChange("socialMedia.facebook", e.target.value)
                  }
                  placeholder="https://facebook.com/yourprofile"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.facebook
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors.facebook && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.facebook}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Instagram className="w-4 h-4 mr-2 text-pink-500" />
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={formData.socialMedia.instagram}
                  onChange={(e) =>
                    handleInputChange("socialMedia.instagram", e.target.value)
                  }
                  placeholder="@yourusername or full URL"
                  maxLength="100"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Linkedin className="w-4 h-4 mr-2 text-blue-500" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) =>
                    handleInputChange("socialMedia.linkedin", e.target.value)
                  }
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.linkedin
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors.linkedin && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.linkedin}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-amber-400" />
                  Personal Website
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.website}
                  onChange={(e) =>
                    handleInputChange("socialMedia.website", e.target.value)
                  }
                  placeholder="https://yourwebsite.com"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.website
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                {errors.website && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.website}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center text-blue-400 mb-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Social Media Guidelines</span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• All social media links are optional but recommended</p>
                <p>• Make sure your profiles are public and professional</p>
                <p>• Your social media will be visible to voters</p>
                <p>
                  • Keep your online presence aligned with your campaign message
                </p>
                <p>
                  • For Twitter and Instagram, you can enter @username or full
                  URL
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-amber-400" />
              Review & Confirm
            </h3>

            <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <p className="text-white font-medium">
                    {formData.firstName} {formData.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="text-white font-medium">{formData.email}</p>
                </div>
                <div>
                  <span className="text-gray-400">Contact:</span>
                  <p className="text-white font-medium">{formData.contactNo}</p>
                </div>
                <div>
                  <span className="text-gray-400">Party:</span>
                  <p className="text-white font-medium">{formData.party}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Position:</span>
                  <p className="text-white font-medium">{formData.position}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">Biography:</span>
                <p className="text-white text-sm mt-1 line-clamp-3">
                  {formData.biography}
                </p>
              </div>

              <div>
                <span className="text-gray-400 text-sm">
                  Manifesto (Preview):
                </span>
                <p className="text-white text-sm mt-1 line-clamp-3">
                  {formData.manifesto}
                </p>
              </div>

              {/* Show experience count */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Experience Entries:</span>
                  <p className="text-white font-medium">
                    {
                      formData.experience.filter(
                        (exp) => exp.title?.trim() || exp.organization?.trim()
                      ).length
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Education Entries:</span>
                  <p className="text-white font-medium">
                    {
                      formData.education.filter(
                        (edu) => edu.degree?.trim() || edu.institution?.trim()
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction PIN Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-amber-400" />
                Transaction PIN <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={formData.transactionPin}
                  onChange={(e) =>
                    handleInputChange("transactionPin", e.target.value)
                  }
                  placeholder="Enter your transaction PIN"
                  maxLength="10"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors pr-12 ${
                    errors.transactionPin
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-amber-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPin ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.transactionPin && (
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.transactionPin}
                </p>
              )}
              <p className="text-xs text-gray-400">
                This PIN is required to confirm your candidate registration
              </p>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-center text-amber-400 mb-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Before You Submit</span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>
                  • Your application will be reviewed by election administrators
                </p>
                <p>
                  • You will receive an email notification about your
                  application status
                </p>
                <p>• Approval typically takes 2-5 business days</p>
                <p>• Make sure all information is accurate and complete</p>
                <p>• You can update your profile after approval</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!showBeCandidateModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/60">
          <div>
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
              <Crown className="w-5 h-5 mr-2 text-amber-400" />
              Be A Candidate
            </h2>
            <p className="text-sm text-gray-300 pt-1">
              Join the election and make your voice heard
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-700/60">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === activeStep;
              const isCompleted = step.id < activeStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? "border-amber-500 bg-amber-500 text-white"
                          : isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-600 bg-gray-700 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive
                          ? "text-amber-400"
                          : isCompleted
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-600"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-700/60">
          {activeStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
          )}

          {activeStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          )}

          {activeStep === 1 && (
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BeCandidateModal;
