const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const getOrderUserId = (user) => user._id || user.id;

const createOrder = async (req, res) => {
	try {
		const { items, deliveryAddress, paymentMethod } = req.body;

		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ message: "Add at least one item to your order." });
		}

		if (!deliveryAddress || !paymentMethod) {
			return res.status(400).json({ message: "Delivery address and payment method are required." });
		}

		const requiredAddressFields = ["fullName", "phone", "address", "city", "state", "pincode"];

		if (
			requiredAddressFields.some(
				(field) => !String(deliveryAddress[field] || "").trim()
			)
		) {
			return res.status(400).json({
				message: "Please provide all required delivery details.",
			});
		}

		if (
			!/^[6-9]\d{9}$/.test(String(deliveryAddress.phone).trim()) ||
			!/^\d{6}$/.test(String(deliveryAddress.pincode).trim())
		) {
			return res.status(400).json({
				message: "Please provide a valid phone number and postal code.",
			});
		}

		if (!["cod", "online"].includes(paymentMethod)) {
			return res.status(400).json({
				message: "Invalid payment method.",
			});
		}

		const quantities = new Map();

		for (const item of items) {
			const productId = item?.product || item?.id || item?._id;
			const quantity = Number(item?.quantity);

			if (!mongoose.isValidObjectId(productId)) {
				return res.status(400).json({
					message: "An order item has an invalid product ID.",
				});
			}

			if (!Number.isInteger(quantity) || quantity < 1) {
				return res.status(400).json({
					message: "Order quantities must be positive whole numbers.",
				});
			}

			const key = String(productId);
			quantities.set(key, (quantities.get(key) || 0) + quantity);
		}

		const productIds = [...quantities.keys()];

		const products = await Product.find({
			_id: { $in: productIds },
		});

		if (products.length !== productIds.length) {
			return res.status(404).json({
				message: "One or more products are no longer available.",
			});
		}

		const orderItems = products.map((product) => {
			const quantity = quantities.get(String(product._id));

			if (!Number.isFinite(product.price) || product.price < 0) {
				throw Object.assign(
					new Error(`${product.name} has an invalid price.`),
					{ status: 400 }
				);
			}

			if (quantity > product.stock || product.stock < 0) {
				throw Object.assign(
					new Error(`${product.name} does not have enough stock.`),
					{ status: 400 }
				);
			}

			return {
				product: product._id,

				name: product.name,

				image: product.image,

				// Save product description with the order
				description: product.description || "",

				// Save product gender with the order
				gender: product.gender || "Unisex",

				price: product.price,

				quantity,
			};
		});

		const subtotal = orderItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);

		const shipping = subtotal === 0 || subtotal >= 1999 ? 0 : 99;

		const tax = Math.round(subtotal * 0.05);

		const reservedItems = [];

		try {
			for (const item of orderItems) {
				const reservation = await Product.updateOne(
					{
						_id: item.product,
						stock: { $gte: item.quantity },
					},
					{
						$inc: { stock: -item.quantity },
					}
				);

				if (reservation.modifiedCount !== 1) {
					throw Object.assign(
						new Error(
							`${item.name} no longer has enough stock.`
						),
						{ status: 409 }
					);
				}

				reservedItems.push(item);
			}

			const order = await Order.create({
				user: getOrderUserId(req.user),

				customer: {
					name: req.user.name,
					email: req.user.email,
					phone: deliveryAddress.phone,
				},

				items: orderItems,

				deliveryAddress,

				paymentMethod,

				subtotal,

				shipping,

				tax,

				total: subtotal + shipping + tax,
			});

			return res.status(201).json({
				success: true,
				order,
			});
		} catch (error) {
			await Promise.all(
				reservedItems.map((item) =>
					Product.updateOne(
						{ _id: item.product },
						{
							$inc: {
								stock: item.quantity,
							},
						}
					)
				)
			).catch((rollbackError) =>
				console.error(
					"Order stock rollback error:",
					rollbackError
				)
			);

			throw error;
		}
	} catch (error) {
		console.error("Create order error:", error);

		return res.status(error.status || 500).json({
			message: error.status
				? error.message
				: "Failed to create order.",
		});
	}
};

const getMyOrders = async (req, res) => {
	try {
		const orders = await Order.find({
			user: getOrderUserId(req.user),
		}).sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			orders,
		});
	} catch (error) {
		console.error("Get user orders error:", error);

		return res.status(500).json({
			message: "Failed to fetch your orders.",
		});
	}
};

const getOrderById = async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid order ID.",
			});
		}

		const order = await Order.findById(req.params.id)
			.populate("user", "name email")
			.populate(
				"items.product",
				"name image description gender price"
			);

		if (!order) {
			return res.status(404).json({
				message: "Order not found.",
			});
		}

		if (
			req.user.role !== "admin" &&
			String(order.user?._id || order.user) !==
				String(getOrderUserId(req.user))
		) {
			return res.status(403).json({
				message: "You cannot access this order.",
			});
		}

		return res.status(200).json({
			success: true,
			order,
		});
	} catch (error) {
		console.error("Get order error:", error);

		return res.status(500).json({
			message: "Failed to fetch order.",
		});
	}
};

const getAllOrders = async (_req, res) => {
	try {
		const orders = await Order.find()
			.populate("user", "name email")
			.populate(
				"items.product",
				"name image description gender price"
			)
			.sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			orders,
		});
	} catch (error) {
		console.error("Get all orders error:", error);

		return res.status(500).json({
			message: "Failed to fetch orders.",
		});
	}
};

const updateOrderStatus = async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({
				message: "Invalid order ID.",
			});
		}

		const allowedStatuses = [
			"Processing",
			"Shipped",
			"Delivered",
			"Cancelled",
		];

		if (!allowedStatuses.includes(req.body.status)) {
			return res.status(400).json({
				message: "Invalid order status.",
			});
		}

		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{
				status: req.body.status,
			},
			{
				new: true,
				runValidators: true,
			}
		)
			.populate("user", "name email")
			.populate(
				"items.product",
				"name image description gender price"
			);

		if (!order) {
			return res.status(404).json({
				message: "Order not found.",
			});
		}

		return res.status(200).json({
			success: true,
			order,
		});
	} catch (error) {
		console.error("Update order status error:", error);

		return res.status(500).json({
			message: "Failed to update order status.",
		});
	}
};

module.exports = {
	createOrder,
	getMyOrders,
	getOrderById,
	getAllOrders,
	updateOrderStatus,
};