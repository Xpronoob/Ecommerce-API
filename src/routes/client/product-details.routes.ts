import { Router } from 'express'
import { ProductDetailsController } from '../../controllers/admin/product-details.controller'
import { ProductDetailsDatasource } from '../../datasources/admin/product-details.datasource'
import { ProductDetailsRepository } from '../../repositories/admin/product-details.repository'

export class ProductDetailsClientRoutes {
  static get routes(): Router {
    const router = Router()

    const datasource = new ProductDetailsDatasource()
    const repository = new ProductDetailsRepository(datasource)

    const controller = new ProductDetailsController(repository)

    router.post('/', controller.create)
    router.patch('/:id', controller.update)
    router.delete('/:id', controller.delete)
    router.get('/:id', controller.getById)
    router.get('/', controller.getAll)

    router.patch('/:productDetailId/toggle-status', controller.toggleStatus)

    return router
  }
}