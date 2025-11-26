# Contributing to Retail Inventory Assistant

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/retail-inventory-assistant.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

Follow the [QUICKSTART.md](QUICKSTART.md) guide to set up your development environment.

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Use async/await for I/O operations
- Maximum line length: 100 characters
- Use Pydantic for data validation

Example:
```python
from typing import List, Optional
from pydantic import BaseModel

async def get_products(
    user_id: str,
    category: Optional[str] = None
) -> List[Product]:
    """Get products for a user, optionally filtered by category."""
    # Implementation
```

### JavaScript/React (Frontend)
- Use functional components with hooks
- Use ES6+ features
- Use async/await over promises
- Maximum line length: 100 characters
- Use meaningful variable names

Example:
```javascript
const ProductList = ({ category }) => {
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await productsAPI.list({ category })
      setProducts(data)
    }
    fetchProducts()
  }, [category])
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## Commit Messages

Use conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

Example:
```
feat(forecast): add seasonal adjustment to demand forecast

Implement seasonal adjustment factors for better forecast accuracy
during Nigerian holidays and special events.

Closes #123
```

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Pull Request Guidelines

1. **One feature per PR**: Keep PRs focused on a single feature or fix
2. **Update documentation**: Update relevant docs if you change functionality
3. **Add tests**: Include tests for new features
4. **Ensure tests pass**: All tests must pass before merging
5. **Update CHANGELOG**: Add entry describing your changes
6. **Link issues**: Reference related issues in PR description

## Areas for Contribution

### High Priority
- [ ] WhatsApp Business API integration
- [ ] Barcode scanning with device camera
- [ ] Multi-store management
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/Excel

### Features
- [ ] Employee role-based access control
- [ ] Supplier management
- [ ] Purchase order tracking
- [ ] Customer loyalty program
- [ ] Batch product import (CSV/Excel)
- [ ] Product images upload
- [ ] Invoice generation
- [ ] Tax calculations
- [ ] Multi-currency support

### ML Improvements
- [ ] Competitor price scraping
- [ ] Sentiment analysis from customer reviews
- [ ] Image-based product recognition
- [ ] Automated categorization
- [ ] Fraud detection
- [ ] Customer segmentation

### Mobile
- [ ] React Native mobile apps
- [ ] Offline-first architecture improvements
- [ ] Push notifications
- [ ] Biometric authentication

### Documentation
- [ ] Video tutorials
- [ ] API client examples (Python, JavaScript)
- [ ] Deployment guides for more platforms
- [ ] Translation to local Nigerian languages

## Code Review Process

1. Maintainer reviews PR
2. Feedback provided if needed
3. Changes requested or approved
4. Once approved, maintainer merges

## Community Guidelines

- Be respectful and inclusive
- Help others learn
- Provide constructive feedback
- Follow the code of conduct

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Join our community chat

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
