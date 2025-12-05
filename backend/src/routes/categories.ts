import { Router, Request, Response } from 'express'
import { readJsonFile, writeJsonFile, ensureDataDirectory } from '../utils/fileStorage'

const router = Router()

interface Category {
  _id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  color?: string | null
  parentId?: string | null
  level?: number
  status: string
  isFeatured?: boolean
  appCount: number
  order?: number
  createdAt: string
  updatedAt: string
}

// Ensure data directory exists on startup
ensureDataDirectory().catch(console.error)

/**
 * @route   GET /api/categories
 * @desc    Get all categories from OneApp Database (JSON file)
 * @access  Public (can be made private by adding auth middleware)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Read categories from JSON file (OneApp Database - local storage)
    const categories = await readJsonFile<Category>('categories.json')
    
    // Filter active categories and sort by order (if exists), then by name
    const activeCategories = categories
      .filter(cat => cat.status === 'active')
      .sort((a, b) => {
        // Sort by order if both have order, otherwise by name
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        if (a.order !== undefined) return -1
        if (b.order !== undefined) return 1
        return a.name.localeCompare(b.name)
      })

    res.json({
      success: true,
      data: activeCategories,
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch categories',
    })
  }
})

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Public (can be made private by adding auth middleware)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required',
      })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Read existing categories from JSON file
    const categories = await readJsonFile<Category>('categories.json')

    // Check if category with same name or slug already exists
    const existing = categories.find(
      cat => cat.name.toLowerCase() === name.trim().toLowerCase() || cat.slug === slug
    )

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name or slug already exists',
      })
    }

    // Get max order to set new category order
    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map(cat => cat.order || 0), -1) + 1
      : 0

    // Create new category
    const newCategory: Category = {
      _id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      slug,
      description: description || null,
      icon: icon || null,
      color: color || null,
      parentId: null,
      level: 0,
      status: 'active',
      isFeatured: false,
      appCount: 0,
      order: maxOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to array and save to file
    categories.push(newCategory)
    await writeJsonFile('categories.json', categories)

    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully',
    })
  } catch (error: any) {
    console.error('Error creating category:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create category',
    })
  }
})

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Public (can be made private by adding auth middleware)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Category ID is required',
      })
    }

    // Read categories from JSON file
    const categories = await readJsonFile<Category>('categories.json')

    // Find category index
    const categoryIndex = categories.findIndex(cat => cat._id === id)
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      })
    }

    const category = categories[categoryIndex]

    // Check if category has apps
    if (category.appCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. There are ${category.appCount} app(s) using this category. Please reassign them first.`,
      })
    }

    // Remove category and save to file
    categories.splice(categoryIndex, 1)
    await writeJsonFile('categories.json', categories)

    res.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete category',
    })
  }
})

/**
 * @route   PUT /api/categories/reorder
 * @desc    Reorder categories
 * @access  Public (can be made private by adding auth middleware)
 * @note    This route must be defined BEFORE /:id to prevent "reorder" from being matched as an ID
 */
router.put('/reorder', async (req: Request, res: Response) => {
  try {
    const { categoryIds } = req.body

    console.log('Reorder request body:', req.body)
    console.log('categoryIds:', categoryIds, 'Type:', typeof categoryIds, 'IsArray:', Array.isArray(categoryIds))

    if (!categoryIds) {
      return res.status(400).json({
        success: false,
        error: 'categoryIds is required',
      })
    }

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({
        success: false,
        error: `categoryIds must be an array, received: ${typeof categoryIds}`,
      })
    }

    if (categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'categoryIds array cannot be empty',
      })
    }

    // Read categories from JSON file
    const categories = await readJsonFile<Category>('categories.json')

    // Update order for each category
    categoryIds.forEach((categoryId: string, index: number) => {
      const categoryIndex = categories.findIndex(cat => cat._id === categoryId)
      if (categoryIndex !== -1) {
        categories[categoryIndex].order = index
        categories[categoryIndex].updatedAt = new Date().toISOString()
      }
    })

    // Save to file
    await writeJsonFile('categories.json', categories)

    res.json({
      success: true,
      message: 'Categories reordered successfully',
    })
  } catch (error: any) {
    console.error('Error reordering categories:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reorder categories',
    })
  }
})

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Public (can be made private by adding auth middleware)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, slug, description, icon, color } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Category ID is required',
      })
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required',
      })
    }

    // Generate slug from name if not provided
    let finalSlug = slug
    if (!finalSlug || !finalSlug.trim()) {
      finalSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    } else {
      // Clean provided slug
      finalSlug = finalSlug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Read categories from JSON file
    const categories = await readJsonFile<Category>('categories.json')

    // Find category index
    const categoryIndex = categories.findIndex(cat => cat._id === id)
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      })
    }

    // Check if another category with same name or slug exists
    const existing = categories.find(
      cat => cat._id !== id && (cat.name.toLowerCase() === name.trim().toLowerCase() || cat.slug === finalSlug)
    )
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name or slug already exists',
      })
    }

    // Update category
    const updatedCategory: Category = {
      ...categories[categoryIndex],
      name: name.trim(),
      slug: finalSlug,
      updatedAt: new Date().toISOString(),
    }

    if (description !== undefined) updatedCategory.description = description || null
    if (icon !== undefined) updatedCategory.icon = icon || null
    if (color !== undefined) updatedCategory.color = color || null

    categories[categoryIndex] = updatedCategory
    await writeJsonFile('categories.json', categories)

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update category',
    })
  }
})

export { router as categoryRoutes }

