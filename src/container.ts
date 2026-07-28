import { prisma } from "./infrastructure/database/prisma.js";
import { AuthController } from "./controllers/AuthController.js";
import { CartController } from "./controllers/CartController.js";
import { ContactController } from "./controllers/ContactController.js";
import { FavoriteController } from "./controllers/FavoriteController.js";
import { OrderController } from "./controllers/OrderController.js";
import { ProductController } from "./controllers/ProductController.js";
import { AuthMiddleware } from "./middleware/AuthMiddleware.js";
import { CartRepository } from "./repositories/CartRepository.js";
import { ContactRepository } from "./repositories/ContactRepository.js";
import { FavoriteRepository } from "./repositories/FavoriteRepository.js";
import { OrderRepository } from "./repositories/OrderRepository.js";
import { ProductRepository } from "./repositories/ProductRepository.js";
import { SessionRepository } from "./repositories/SessionRepository.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { AuthRoutes } from "./routes/AuthRoutes.js";
import { CartRoutes } from "./routes/CartRoutes.js";
import { ContactRoutes } from "./routes/ContactRoutes.js";
import { FavoriteRoutes } from "./routes/FavoriteRoutes.js";
import { OrderRoutes } from "./routes/OrderRoutes.js";
import { ProductRoutes } from "./routes/ProductRoutes.js";
import { AuthService } from "./services/AuthService.js";
import { CartService } from "./services/CartService.js";
import { ContactService } from "./services/ContactService.js";
import { FavoriteService } from "./services/FavoriteService.js";
import { OrderService } from "./services/OrderService.js";
import { PasswordService } from "./services/PasswordService.js";
import { ProductService } from "./services/ProductService.js";
import { TokenService } from "./services/TokenService.js";

const users = new UserRepository(prisma);
const sessions = new SessionRepository(prisma);
const products = new ProductRepository(prisma);
const carts = new CartRepository(prisma);
const favorites = new FavoriteRepository(prisma);
const orders = new OrderRepository(prisma);
const contacts = new ContactRepository(prisma);

const passwords = new PasswordService();
const tokens = new TokenService();
const authMiddleware = new AuthMiddleware(tokens, sessions);

const authService = new AuthService(users, sessions, passwords, tokens);
const productService = new ProductService(products);
const cartService = new CartService(carts, products);
const favoriteService = new FavoriteService(favorites, products);
const orderService = new OrderService(prisma, orders);
const contactService = new ContactService(contacts);

const authController = new AuthController(authService);
const productController = new ProductController(productService);
const cartController = new CartController(cartService);
const favoriteController = new FavoriteController(favoriteService);
const orderController = new OrderController(orderService);
const contactController = new ContactController(contactService);

export const container = {
  database: prisma,
  authMiddleware,
  routes: {
    auth: new AuthRoutes(authController, authMiddleware).build(),
    products: new ProductRoutes(productController, authMiddleware).build(),
    cart: new CartRoutes(cartController, authMiddleware).build(),
    favorites: new FavoriteRoutes(favoriteController, authMiddleware).build(),
    orders: new OrderRoutes(orderController, authMiddleware).build(),
    contact: new ContactRoutes(contactController).build()
  }
};
