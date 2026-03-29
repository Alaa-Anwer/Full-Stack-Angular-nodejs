import { orderService } from "../services/orderService.js";


export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder({
      userId: req.user.userId,
      products: req.body.products,
      protocol: req.protocol,
      host: req.get("host"),
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { data, pagination } = await orderService.getUserOrders({
      userId: req.user.userId,
      page: req.query.page,
      limit: req.query.limit,
      protocol: req.protocol,
      host: req.get("host"),
    });

    res.status(200).json({
      success: true,
      message: "User orders fetched successfully.",
      data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllOrders = async (req, res, next) => {
  try {
    const { data, pagination } = await orderService.getAllOrders({
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      protocol: req.protocol,
      host: req.get("host"),
    });

    res.status(200).json({
      success: true,
      message: "All orders fetched successfully.",
      data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};


export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus({
      orderId: req.params.id,
      status: req.body.status,
      protocol: req.protocol,
      host: req.get("host"),
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};


export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById({
      orderId: req.params.id,
      requester: req.user,
      protocol: req.protocol,
      host: req.get("host"),
    });

    res.status(200).json({
      success: true,
      message: "Order fetched successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteOrder = async (req, res, next) => {
  try {
    await orderService.deleteOrder({
      orderId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully and stock restored.",
    });
  } catch (error) {
    next(error);
  }
};
