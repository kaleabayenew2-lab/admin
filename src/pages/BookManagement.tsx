import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MenuBook,
  Event,
  Person,
  Category,
  Visibility,
  Download,
  Refresh
} from '@mui/icons-material';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'available' | 'borrowed' | 'reserved';
  borrower?: string;
  borrowDate?: string;
  returnDate?: string;
  isbn: string;
  publishedYear: number;
  addedDate: string;
  description?: string;
}

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    publishedYear: new Date().getFullYear(),
    description: ''
  });

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'Medical', 'History', 'Biography', 'Children'];

  useEffect(() => {
    // Simulate loading books data
    setTimeout(() => {
      setBooks([
        {
          id: '1',
          title: 'Medical Terminology: A Comprehensive Guide',
          author: 'Dr. John Smith',
          category: 'Medical',
          status: 'available',
          isbn: '978-1234567890',
          publishedYear: 2020,
          addedDate: '2024-01-15',
          description: 'Complete medical terminology reference for healthcare professionals'
        },
        {
          id: '2',
          title: 'React Programming: Modern Web Development',
          author: 'Jane Doe',
          category: 'Technology',
          status: 'borrowed',
          borrower: 'User123',
          borrowDate: '2024-03-01',
          returnDate: '2024-03-15',
          isbn: '978-0987654321',
          publishedYear: 2021,
          addedDate: '2024-01-20',
          description: 'Learn React.js with modern hooks and best practices'
        },
        {
          id: '3',
          title: 'Human Anatomy: Structure and Function',
          author: 'Dr. Sarah Johnson',
          category: 'Medical',
          status: 'reserved',
          borrower: 'User456',
          isbn: '978-1122334455',
          publishedYear: 2019,
          addedDate: '2024-02-01',
          description: 'Detailed exploration of human anatomical systems'
        },
        {
          id: '4',
          title: 'The Art of Fiction Writing',
          author: 'Robert Williams',
          category: 'Fiction',
          status: 'available',
          isbn: '978-5566778899',
          publishedYear: 2022,
          addedDate: '2024-02-15',
          description: 'Master the craft of storytelling and narrative structure'
        },
        {
          id: '5',
          title: 'Data Science Fundamentals',
          author: 'Emily Chen',
          category: 'Technology',
          status: 'borrowed',
          borrower: 'User789',
          borrowDate: '2024-03-05',
          returnDate: '2024-03-19',
          isbn: '978-9988776655',
          publishedYear: 2023,
          addedDate: '2024-01-25',
          description: 'Introduction to data analysis and machine learning'
        },
        {
          id: '6',
          title: 'World History: Ancient Civilizations',
          author: 'Prof. Michael Brown',
          category: 'History',
          status: 'available',
          isbn: '978-3344556677',
          publishedYear: 2021,
          addedDate: '2024-03-01',
          description: 'Explore the rise and fall of ancient civilizations'
        },
        {
          id: '7',
          title: 'Children\'s Science Encyclopedia',
          author: 'Lisa Anderson',
          category: 'Children',
          status: 'available',
          isbn: '978-7788990011',
          publishedYear: 2022,
          addedDate: '2024-02-20',
          description: 'Fun and educational science content for young readers'
        },
        {
          id: '8',
          title: 'Biography of Innovation Leaders',
          author: 'David Martinez',
          category: 'Biography',
          status: 'reserved',
          borrower: 'User246',
          isbn: '978-2233445566',
          publishedYear: 2023,
          addedDate: '2024-03-10',
          description: 'Inspiring stories of tech industry pioneers'
        },
        {
          id: '9',
          title: 'Pharmaceutical Chemistry',
          author: 'Dr. Rachel Green',
          category: 'Science',
          status: 'borrowed',
          borrower: 'User135',
          borrowDate: '2024-03-08',
          returnDate: '2024-03-22',
          isbn: '978-4455667788',
          publishedYear: 2020,
          addedDate: '2024-01-30',
          description: 'Comprehensive guide to pharmaceutical compounds'
        },
        {
          id: '10',
          title: 'Non-Fiction Writing Techniques',
          author: 'Susan Taylor',
          category: 'Non-Fiction',
          status: 'available',
          isbn: '978-6677889900',
          publishedYear: 2022,
          addedDate: '2024-03-05',
          description: 'Master the art of compelling non-fiction storytelling'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddBook = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      category: '',
      isbn: '',
      publishedYear: new Date().getFullYear(),
      description: ''
    });
    setOpenDialog(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      description: book.description || ''
    });
    setOpenDialog(true);
  };

  const handleSaveBook = () => {
    if (editingBook) {
      // Update existing book
      setBooks(prev => prev.map(book => 
        book.id === editingBook.id 
          ? { ...book, ...formData }
          : book
      ));
    } else {
      // Add new book
      const newBook: Book = {
        id: Date.now().toString(),
        ...formData,
        status: 'available',
        addedDate: new Date().toISOString().split('T')[0]
      };
      setBooks(prev => [...prev, newBook]);
    }
    setOpenDialog(false);
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks(prev => prev.filter(book => book.id !== bookId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'borrowed': return 'warning';
      case 'reserved': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Visibility />;
      case 'borrowed': return <Person />;
      case 'reserved': return <Event />;
      default: return <MenuBook />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading books...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📚 Book Management
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Manage library books, track borrowing, and monitor inventory
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Books
              </Typography>
              <Typography variant="h4">
                {books.length}
              </Typography>
              <MenuBook color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available
              </Typography>
              <Typography variant="h4" color="success.main">
                {books.filter(b => b.status === 'available').length}
              </Typography>
              <Visibility color="success" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Borrowed
              </Typography>
              <Typography variant="h4" color="warning.main">
                {books.filter(b => b.status === 'borrowed').length}
              </Typography>
              <Person color="warning" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Reserved
              </Typography>
              <Typography variant="h4" color="info.main">
                {books.filter(b => b.status === 'reserved').length}
              </Typography>
              <Event color="info" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search books by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddBook}
              sx={{ height: '56px' }}
            >
              Add Book
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Books Table */}
      <Paper>
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h6">
            Library Collection ({filteredBooks.length} books)
          </Typography>
          <Box>
            <Button variant="outlined" startIcon={<Download />} sx={{ mr: 1 }}>
              Export
            </Button>
            <Button variant="outlined" startIcon={<Refresh />}>
              Refresh
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Borrower</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>ISBN</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {book.title}
                      </Typography>
                      {book.description && (
                        <Typography variant="caption" color="textSecondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                          {book.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Chip
                      label={book.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{book.publishedYear}</TableCell>
                  <TableCell>
                    <Chip
                      label={book.status}
                      size="small"
                      color={getStatusColor(book.status)}
                      icon={getStatusIcon(book.status)}
                    />
                  </TableCell>
                  <TableCell>{book.borrower || '-'}</TableCell>
                  <TableCell>{book.returnDate || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="caption" component="code">
                      {book.isbn}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditBook(book)}
                        color="primary"
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBook(book.id)}
                        color="error"
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBook ? 'Edit Book' : 'Add New Book'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a brief description of the book..."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ISBN"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Published Year"
                  type="number"
                  value={formData.publishedYear}
                  onChange={(e) => setFormData({ ...formData, publishedYear: parseInt(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveBook} variant="contained">
            {editingBook ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
