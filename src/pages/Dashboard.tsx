
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, User, Star, DollarSign, Clock, Edit, Eye, Trash2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  user_type: 'creator' | 'client';
  email: string;
  bio?: string;
  location?: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  delivery_time: number;
  is_active: boolean;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      
      // If user is a creator or admin, fetch their services
      if (data.user_type === 'creator' || data.email === 'admin@freelancehub.com') {
        fetchServices(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (profileData: Profile) => {
    try {
      let query = supabase.from("services").select("*");
      
      // If admin, show all services, otherwise only user's services
      if (profileData.email !== 'admin@freelancehub.com') {
        query = query.eq("creator_id", profileData.id);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !currentStatus })
        .eq("id", serviceId);

      if (error) throw error;

      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, is_active: !currentStatus }
          : service
      ));
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              There was an issue loading your profile. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCreator = profile.user_type === 'creator';
  const isAdmin = profile.email === 'admin@freelancehub.com';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.full_name}! {isAdmin && <Badge variant="destructive">Admin</Badge>}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? "Manage all platform services and users" 
              : isCreator 
                ? "Manage your services and track your earnings" 
                : "Find services and manage your projects"
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Total Services" : isCreator ? "Active Services" : "Active Projects"}
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Platform-wide" : isCreator ? "Services available" : "Projects in progress"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isCreator || isAdmin ? "Total Earnings" : "Total Spent"}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">
                {isCreator || isAdmin ? "From completed projects" : "On services"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Based on reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Services */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {isAdmin ? "All Platform Services" : isCreator ? "Your Services" : "Your Projects"}
                    </CardTitle>
                    <CardDescription>
                      {isAdmin 
                        ? "Manage all services on the platform" 
                        : isCreator 
                          ? "Manage your service offerings" 
                          : "Track your hired services"
                      }
                    </CardDescription>
                  </div>
                  {(isCreator || isAdmin) && (
                    <Button onClick={() => navigate("/create-service")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Service
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">
                      {isAdmin 
                        ? "No services have been created yet" 
                        : isCreator 
                          ? "You haven't created any services yet" 
                          : "You haven't hired any services yet"
                      }
                    </p>
                    <Button onClick={() => navigate(isCreator || isAdmin ? "/create-service" : "/browse")}>
                      <Plus className="h-4 w-4 mr-2" />
                      {isCreator || isAdmin ? "Create Service" : "Browse Services"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{service.title}</h3>
                          <div className="flex gap-2">
                            <Badge variant={service.is_active ? "default" : "secondary"}>
                              {service.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">
                              {formatCategory(service.category)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">${service.price}</span>
                            <span>{service.delivery_time} days</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleServiceStatus(service.id, service.is_active)}
                            >
                              {service.is_active ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4 opacity-50" />}
                            </Button>
                            {isAdmin && (
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Type</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 capitalize">{profile.user_type}</p>
                    {isAdmin && <Badge variant="destructive">Admin</Badge>}
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isCreator || isAdmin ? (
                  <>
                    <Button className="w-full" onClick={() => navigate("/create-service")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Service
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/browse")}>
                      Browse All Services
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full" onClick={() => navigate("/browse")}>
                      Browse Services
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Order History
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
