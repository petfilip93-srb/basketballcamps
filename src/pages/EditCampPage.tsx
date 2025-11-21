import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Country } from '../types';
import { CheckCircle, AlertCircle, Calendar, Plus, X, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface CampDate {
  id?: string;
  startDate: string;
  endDate: string;
  price: string;
}

interface EditCampPageProps {
  onBack?: () => void;
}

export function EditCampPage({ onBack }: EditCampPageProps) {
  const { user } = useAuth();
  const [campId, setCampId] = useState<string>('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    campName: '',
    campEmail: '',
    countryId: '',
    location: '',
    description: '',
    ageMin: '',
    ageMax: '',
    gender: 'both',
    capacity: '30',
  });

  const [campDates, setCampDates] = useState<CampDate[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; image_url: string; image_order: number }>>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [profileImageIndex, setProfileImageIndex] = useState<number>(0);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    setCampId(id);
    fetchCountries();
    if (id) {
      fetchCampData(id);
    }
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

  const fetchCampData = async (id: string) => {
    try {
      setLoading(true);

      const { data: camp, error: campError } = await supabase
        .from('camps')
        .select(`
          *,
          camp_dates(*),
          camp_images(*)
        `)
        .eq('id', id)
        .eq('owner_id', user?.id)
        .single();

      if (campError) throw campError;

      setFormData({
        campName: camp.camp_name,
        campEmail: camp.camp_email || '',
        countryId: camp.country_id,
        location: camp.location,
        description: camp.description,
        ageMin: camp.age_group_min.toString(),
        ageMax: camp.age_group_max.toString(),
        gender: camp.gender,
        capacity: camp.capacity.toString(),
      });

      const dates = camp.camp_dates.map((d: any) => ({
        id: d.id,
        startDate: d.start_date,
        endDate: d.end_date,
        price: d.price.toString(),
      }));
      setCampDates(dates.length > 0 ? dates : [{ startDate: '', endDate: '', price: '' }]);

      const images = camp.camp_images.sort((a: any, b: any) => a.image_order - b.image_order);
      setExistingImages(images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load camp data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const addDateRange = () => {
    setCampDates([...campDates, { startDate: '', endDate: '', price: '' }]);
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

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (existingImages.length + newImageFiles.length + files.length > 50) {
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

    setNewImageFiles([...newImageFiles, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
  };

  const removeExistingImage = async (imageId: string, index: number) => {
    try {
      const { error } = await supabase
        .from('camp_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setExistingImages(existingImages.filter(img => img.id !== imageId));
      if (profileImageIndex === index && existingImages.length > 1) {
        setProfileImageIndex(0);
      } else if (profileImageIndex > index) {
        setProfileImageIndex(profileImageIndex - 1);
      }
    } catch (err) {
      setError('Failed to remove image');
    }
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const setAsProfilePhoto = (index: number) => {
    setProfileImageIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
      }

      if (formData.description.length > 10000) {
        throw new Error('Description must be 10000 characters or less');
      }

      const { error: campError } = await supabase
        .from('camps')
        .update({
          camp_name: formData.campName,
          camp_email: formData.campEmail,
          country_id: formData.countryId,
          location: formData.location,
          description: formData.description,
          age_group_min: parseInt(formData.ageMin),
          age_group_max: parseInt(formData.ageMax),
          gender: formData.gender,
          capacity: parseInt(formData.capacity),
        })
        .eq('id', campId)
        .eq('owner_id', user?.id);

      if (campError) throw campError;

      const { error: deleteDatesError } = await supabase
        .from('camp_dates')
        .delete()
        .eq('camp_id', campId);

      if (deleteDatesError) throw deleteDatesError;

      const datesToInsert = campDates.map(dateRange => ({
        camp_id: campId,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        duration_days: calculateDuration(dateRange.startDate, dateRange.endDate),
        price: parseFloat(dateRange.price),
      }));

      const { error: datesError } = await supabase
        .from('camp_dates')
        .insert(datesToInsert);

      if (datesError) throw datesError;

      if (newImageFiles.length > 0) {
        setUploadingImages(true);
        const startOrder = existingImages.length;

        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${campId}/${Date.now()}-${i}.${fileExt}`;

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

          const { error: imageError } = await supabase
            .from('camp_images')
            .insert({
              camp_id: campId,
              image_url: publicUrl,
              image_order: startOrder + i
            });

          if (imageError) throw imageError;
        }
      }

      if (profileImageIndex !== 0 && existingImages.length > 0) {
        const allImages = [...existingImages];
        for (let i = 0; i < allImages.length; i++) {
          await supabase
            .from('camp_images')
            .update({ image_order: i === profileImageIndex ? 0 : i < profileImageIndex ? i + 1 : i })
            .eq('id', allImages[i].id);
        }
      }

      newImagePreviews.forEach(preview => URL.revokeObjectURL(preview));

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/camp-owner/dashboard';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update camp');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading camp data...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Camp Updated!</h2>
          <p className="text-slate-600">
            Your camp has been updated successfully. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Edit Camp</h1>
              <p className="text-slate-600">Update your camp information</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
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
                          {country.flag_emoji} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location (City) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              <p className="text-sm text-slate-600 mb-4">
                Manage your camp images (maximum 50 images total, 10MB each)
              </p>

              <div className="space-y-4">
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Current Images ({existingImages.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {existingImages.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.image_url}
                            alt={`Camp ${index + 1}`}
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
                                Mark as Profile
                              </button>
                            )}
                          </div>
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.id, index)}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500">
                        <span className="font-semibold">Click to upload</span> new images
                      </p>
                      <p className="text-xs text-slate-500">
                        {totalImages} / 50 images
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleNewImageChange}
                      disabled={totalImages >= 50}
                    />
                  </label>
                </div>

                {newImagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      New Images to Upload ({newImageFiles.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                          />
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                            NEW
                          </div>
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Camp Dates & Pricing</h2>

              <div className="space-y-4">
                {campDates.map((dateRange, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900">Date Range {index + 1}</h3>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={dateRange.startDate}
                          onChange={(e) => updateDateRange(index, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          End Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={dateRange.endDate}
                          onChange={(e) => updateDateRange(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Price (€) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={dateRange.price}
                          onChange={(e) => updateDateRange(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    </div>

                    {dateRange.startDate && dateRange.endDate && (
                      <div className="mt-2 text-xs text-slate-600">
                        Duration: {calculateDuration(dateRange.startDate, dateRange.endDate)} days
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDateRange}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Date Range
                </button>
              </div>
            </div>

            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Participant Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Age Range *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      min="5"
                      max="50"
                      value={formData.ageMin}
                      onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      required
                      min="5"
                      max="50"
                      value={formData.ageMax}
                      onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender *
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="both">Both (Co-ed)</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Capacity (Max Participants) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => window.location.href = '/camp-owner/dashboard'}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImages}
                className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? 'Uploading Images...' : saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
