import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { finesAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

function FinesView() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchFines();
  }, [statusFilter]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = userRole === 'student' 
        ? await finesAPI.getStudentFines(statusFilter)
        : await finesAPI.getAll({ status: statusFilter });
      
      setFines(userRole === 'student' ? response.data.fines : response.data.fines);
    } catch (error) {
      console.error('Failed to fetch fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId) => {
    try {
      setProcessing(prev => ({ ...prev, [fineId]: 'paying' }));
      await finesAPI.pay(fineId);
      fetchFines(); // Refresh the list
    } catch (error) {
      console.error('Failed to pay fine:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [fineId]: false }));
    }
  };

  const handleWaiveFine = async (fineId) => {
    try {
      setProcessing(prev => ({ ...prev, [fineId]: 'waiving' }));
      await finesAPI.waive(fineId, 'Fine waived by librarian');
      fetchFines(); // Refresh the list
    } catch (error) {
      console.error('Failed to waive fine:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [fineId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'destructive',
      paid: 'default',
      waived: 'secondary'
    };
    
    const labels = {
      pending: 'Pending',
      paid: 'Paid',
      waived: 'Waived'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {userRole === 'student' ? 'My Fines' : 'Manage Fines'}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'student' 
              ? 'View and pay your outstanding fines' 
              : 'Manage all library fines'}
          </p>
        </div>
      </div>

      {userRole === 'librarian' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <p>Filter by Status:</p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fines</CardTitle>
          <CardDescription>
            {userRole === 'student' 
              ? 'Your outstanding and paid fines' 
              : 'All library fines with management options'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : fines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fines found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  {userRole === 'librarian' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>{fine.student?.name || 'N/A'}</TableCell>
                    <TableCell>{fine.issuedBook?.book?.title || 'N/A'}</TableCell>
                    <TableCell>
                      {fine.issuedBook?.issue_date 
                        ? new Date(fine.issuedBook.issue_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {fine.issuedBook?.due_date 
                        ? new Date(fine.issuedBook.due_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>{fine.days_overdue}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        <IndianRupee className="h-4 w-4" />
                        {parseFloat(fine.amount).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(fine.status)}</TableCell>
                    {userRole === 'librarian' && (
                      <TableCell>
                        <div className="flex gap-2">
                          {fine.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handlePayFine(fine.id)}
                                disabled={processing[fine.id]}
                              >
                                {processing[fine.id] === 'paying' ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                Mark Paid
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleWaiveFine(fine.id)}
                                disabled={processing[fine.id]}
                              >
                                {processing[fine.id] === 'waiving' ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                Waive
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FinesView;