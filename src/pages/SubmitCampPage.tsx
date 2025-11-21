import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Country } from '../types';
import { CheckCircle, AlertCircle, Calendar, Users, Euro, Plus, X, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface CampDate {
  startDate: string;
  endDate: string;
  price: string;
  commission?: string;
}

interface SubmitCampPageProps {
  onNavigateToAuth?: () => void;
  onBack?: () => void;
  isFirstCamp?: boolean;
}

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

export function SubmitCampPage({ onNavigateToAuth, onBack, isFirstCamp = true }: SubmitCampPageProps) {
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-6">
            You need to sign in or create an account to submit a basketball camp.
          </p>
          <button
            onClick={onNavigateToAuth}
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    campEmail: '',
    campName: '',
    countryId: '',
    location: '',
    description: '',
    ageMin: '',
    ageMax: '',
    gender: 'both',
    capacity: '30',
  });

  const [campDates, setCampDates] = useState<CampDate[]>([
    { startDate: '', endDate: '', price: '', commission: '' }
  ]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [profileImageIndex, setProfileImageIndex] = useState<number>(0);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');

      if (error) throw error;
      setCountries(data || []);
    } catch (err) {
      console.error('Failed to load countries:', err);
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const addDateRange = () => {
    setCampDates([...campDates, { startDate: '', endDate: '', price: '', commission: '' }]);
  };

  const removeDateRange = (index: number) => {
    if (campDates.length > 1) {
      setCampDates(campDates.filter((_, i) => i !== index));
    }
  };

  const updateDateRange = (index: number, field: keyof CampDate, value: string) => {
    const updated = [...campDates];
    updated[index][field] = value;
    setCampDates(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (imageFiles.length + files.length > 50) {
      setError('Maximum 50 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Each image must be less than 10MB');
        return false;
      }
      return true;
    });

    const newImageFiles = [...imageFiles, ...validFiles];
    setImageFiles(newImageFiles);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);

    if (profileImageIndex === index) {
      setProfileImageIndex(0);
    } else if (profileImageIndex > index) {
      setProfileImageIndex(profileImageIndex - 1);
    }
  };

  const setAsProfilePhoto = (index: number) => {
    setProfileImageIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      for (const dateRange of campDates) {
        if (!dateRange.startDate || !dateRange.endDate || !dateRange.price) {
          throw new Error('Please fill in all date ranges and prices');
        }
        const duration = calculateDuration(dateRange.startDate, dateRange.endDate);
        if (duration <= 0) {
          throw new Error('End date must be after start date for all date ranges');
        }

        const price = parseFloat(dateRange.price);
        const commission = parseFloat(dateRange.commission || '0');
        const minimumCommission = price * 0.05;

        if (commission < minimumCommission) {
          throw new Error('Commission amount is below the minimum required threshold');
        }
      }

      if (formData.description.length > 10000) {
        throw new Error('Description must be 10000 characters or less');
      }

      if (imageFiles.length === 0) {
        throw new Error('Please upload at least one image');
      }

      const submissionPayload: any = {
        camp_email: formData.campEmail,
        camp_name: formData.campName,
        country_id: formData.countryId,
        location: formData.location,
        description: formData.description,
        age_group_min: parseInt(formData.ageMin),
        age_group_max: parseInt(formData.ageMax),
        gender: formData.gender,
        capacity: parseInt(formData.capacity),
        owner_id: user.id,
      };

      if (isFirstCamp) {
        submissionPayload.owner_name = formData.ownerName;
        submissionPayload.owner_email = formData.ownerEmail;
        submissionPayload.owner_phone = formData.ownerPhone;
      }

      const { data: submissionData, error: submitError } = await supabase
        .from('camp_submissions')
        .insert([submissionPayload])
        .select()
        .single();

      if (submitError) throw submitError;

      const datesWithSubmissionId = campDates.map(dateRange => ({
        submission_id: submissionData.id,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        duration_days: calculateDuration(dateRange.startDate, dateRange.endDate),
        price: parseFloat(dateRange.price),
      }));

      const { error: datesError } = await supabase
        .from('camp_submission_dates')
        .insert(datesWithSubmissionId);

      if (datesError) throw datesError;

      setUploadingImages(true);
      const imageUrls: { image_url: string; image_order: number }[] = [];

      const orderedIndexes = imageFiles.map((_, i) => i);
      orderedIndexes.splice(orderedIndexes.indexOf(profileImageIndex), 1);
      orderedIndexes.unshift(profileImageIndex);

      for (let order = 0; order < orderedIndexes.length; order++) {
        const i = orderedIndexes[order];
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${submissionData.id}/${Date.now()}-${order}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('camp-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('camp-images')
          .getPublicUrl(fileName);

        imageUrls.push({
          image_url: publicUrl,
          image_order: order
        });
      }

      const imagesWithSubmissionId = imageUrls.map(img => ({
        submission_id: submissionData.id,
        ...img
      }));

      const { error: imagesError } = await supabase
        .from('camp_submission_images')
        .insert(imagesWithSubmissionId);

      if (imagesError) throw imagesError;

      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));

      setSuccess(true);
      setFormData({
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        campEmail: '',
        campName: '',
        countryId: '',
        location: '',
        description: '',
        ageMin: '',
        ageMax: '',
        gender: 'both',
        capacity: '30',
      });
      setCampDates([{ startDate: '', endDate: '', price: '', commission: '' }]);
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit camp');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg text-center relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-4 left-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Back to My Camps"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Thank You for Submitting!</h2>

          <div className="text-left bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 text-center">What Happens Next?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>I will review your camp submission within 24 hours</li>
              <li>After approval, your camp will be listed on platform</li>
              <li>You'll receive booking requests directly via email mentioned under Camp email address</li>
            </ol>
          </div>

          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Submit Another Camp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-4 left-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Back to My Camps"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center justify-between mb-6 mt-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {isFirstCamp ? 'Submit Your Basketball Camp' : 'Add New Camp'}
              </h1>
              <p className="text-slate-600">
                {isFirstCamp
                  ? "Fill out the form below to list your basketball camp on our platform. We'll review your submission and contact you shortly."
                  : "Add another camp to your profile. Your contact information is already saved."
                }
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isFirstCamp && (
              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Contact Information</h2>
                <p className="text-sm text-slate-500 mb-4">(Internal Only - Not visible to public)</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required={isFirstCamp}
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required={isFirstCamp}
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required={isFirstCamp}
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Camp Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Camp Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.campName}
                    onChange={(e) => setFormData({ ...formData, campName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Camp Email Address *
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    This email will receive booking requests from participants
                  </p>
                  <input
                    type="email"
                    required
                    value={formData.campEmail}
                    onChange={(e) => setFormData({ ...formData, campEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Country *
                    </label>
                    <select
                      required
                      value={formData.countryId}
                      onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City / Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. Belgrade, Serbia"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description * (Max 10000 characters)
                  </label>
                  <textarea
                    required
                    rows={6}
                    maxLength={10000}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe your camp's features, training programs, facilities, etc."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.description.length} / 10000 characters
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Camp Images</h2>
              <p className="text-sm text-slate-600 mb-4">Upload images of your camp (maximum 50 images, 10MB each)</p>

              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Uploaded Images ({imageFiles.length} / 50)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg ${
                              profileImageIndex === index
                                ? 'border-4 border-orange-500'
                                : 'border-2 border-slate-200'
                            }`}
                          />
                          {profileImageIndex === index && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                              Profile Photo
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                            {profileImageIndex !== index && (
                              <button
                                type="button"
                                onClick={() => setAsProfilePhoto(index)}
                                className="flex-1 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 font-medium"
                              >
                                Mark as Profile Photo
                              </button>
                            )}
                          </div>
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Select which image should be the profile photo by clicking "Mark as Profile Photo" button on any image.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Camp Dates & Pricing</h2>
              <p className="text-sm text-slate-600 mb-4">Add all available dates for your camp with their respective prices</p>

              <div className="space-y-4">
                {campDates.map((dateRange, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900">Date Range {index + 1}</h3>
                      {campDates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDateRange(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={dateRange.startDate}
                          onChange={(e) => updateDateRange(index, 'startDate', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          End Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={dateRange.endDate}
                          onChange={(e) => updateDateRange(index, 'endDate', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Euro className="w-4 h-4 inline mr-1" />
                          Price (€) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={dateRange.price}
                          onChange={(e) => updateDateRange(index, 'price', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="€"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Euro className="w-4 h-4 inline mr-1" />
                          Commission (€) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={dateRange.commission || ''}
                          onChange={(e) => updateDateRange(index, 'commission', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="€"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Commission fee per participant
                        </p>
                      </div>
                    </div>

                    {dateRange.startDate && dateRange.endDate && (
                      <p className="text-sm text-slate-600 mt-2">
                        Duration: {calculateDuration(dateRange.startDate, dateRange.endDate)} days
                      </p>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDateRange}
                  className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add More Dates
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Participant Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Min Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="25"
                      value={formData.ageMin}
                      onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Max Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="25"
                      value={formData.ageMax}
                      onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min="10"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Participants *
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="both">Boys & Girls</option>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? 'Uploading Images...' : loading ? 'Submitting...' : 'Submit Camp for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
