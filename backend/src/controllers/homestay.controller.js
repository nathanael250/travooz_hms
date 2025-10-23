const { Homestay } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../../config/database");
const ImageService = require("../services/image.service");

// Get all homestays for the current user
const getHomestays = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;

    // Public endpoint: show all homestays, no user-based filtering
    const whereClause = {};

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Add status filter
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: homestays } = await Homestay.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    // Get images for each homestay
    const homestaysWithImages = await Promise.all(
      homestays.map(async (homestay) => {
        const images = await sequelize.query(
          "SELECT * FROM homestay_images WHERE homestay_id = ? ORDER BY image_order",
          {
            replacements: [homestay.homestay_id],
            type: sequelize.QueryTypes.SELECT,
          }
        );
        
        return {
          ...homestay.toJSON(),
          images: images
        };
      })
    );

    res.json({
      success: true,
      homestays: homestaysWithImages,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching homestays:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching homestays",
      error: error.message,
    });
  }
};

// Get single homestay by ID with all related data
const getHomestayById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get homestay basic info
    const homestay = await Homestay.findOne({
      where: {
        homestay_id: id,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found",
      });
    }

    // Get homestay images
    const homestayImages = await sequelize.query(
      "SELECT * FROM homestay_images WHERE homestay_id = ? ORDER BY image_order",
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get room types with their images and amenities
    const roomTypes = await sequelize.query(
      `SELECT rt.*, ri.image_path, ri.image_type, ri.image_order 
       FROM room_types rt 
       LEFT JOIN room_images ri ON rt.room_type_id = ri.room_type_id 
       WHERE rt.homestay_id = ? 
       ORDER BY rt.created_at, ri.image_order`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Group room images by room type
    const roomTypesGrouped = {};
    roomTypes.forEach((room) => {
      if (!roomTypesGrouped[room.room_type_id]) {
        roomTypesGrouped[room.room_type_id] = {
          room_type_id: room.room_type_id,
          name: room.name,
          description: room.description,
          price: room.price,
          max_people: room.max_people,
          size_sqm: room.size_sqm,
          included: room.included,
          // Parse amenities from JSON columns
          amenities: {
            minibar: room.minibar,
            tea_coffee_facilities: room.tea_coffee_facilities,
            wardrobe_hangers: room.wardrobe_hangers,
            luggage_rack: room.luggage_rack,
            safe: room.safe,
            air_conditioner: room.air_conditioner,
            heater: room.heater,
            fan: room.fan,
            wifi: room.wifi,
            tv: room.tv,
            speaker: room.speaker,
            phone: room.phone,
            usb_charging_points: room.usb_charging_points,
            power_adapters: room.power_adapters,
            desk_workspace: room.desk_workspace,
            iron_ironing_board: room.iron_ironing_board,
            hairdryer: room.hairdryer,
            towels: room.towels,
            bathrobes: room.bathrobes,
            slippers: room.slippers,
            toiletries: room.toiletries,
            teeth_shaving_kits: room.teeth_shaving_kits,
            table_lamps: room.table_lamps,
            bedside_lamps: room.bedside_lamps,
            alarm_clock: room.alarm_clock,
            laundry_bag: room.laundry_bag,
          },
          images: [],
        };
      }
      if (room.image_path) {
        roomTypesGrouped[room.room_type_id].images.push({
          image_path: room.image_path,
          image_type: room.image_type,
          image_order: room.image_order,
        });
      }
    });

    // Get restaurant information with images and menu items
    let restaurant = null;
    const restaurantData = await sequelize.query(
      "SELECT * FROM hotel_restaurants WHERE homestay_id = ?",
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (restaurantData.length > 0) {
      const restaurantInfo = restaurantData[0];

      // Get restaurant images
      const restaurantImages = await sequelize.query(
        "SELECT * FROM hotel_restaurant_images WHERE restaurant_id = ? ORDER BY image_order",
        {
          replacements: [restaurantInfo.restaurant_id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // Get menu items
      const menuItems = await sequelize.query(
        "SELECT * FROM hotel_menu WHERE restaurant_id = ? ORDER BY created_at",
        {
          replacements: [restaurantInfo.restaurant_id],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      restaurant = {
        ...restaurantInfo,
        images: restaurantImages,
        menu_items: menuItems,
      };
    }

    // Prepare homestay amenities object
    const homestayAmenities = {
      free_wifi: homestay.free_wifi,
      parking_available: homestay.parking_available,
      pet_friendly: homestay.pet_friendly,
      swimming_pool: homestay.swimming_pool,
      spa: homestay.spa,
      fitness_center: homestay.fitness_center,
      restaurant: homestay.restaurant,
      bar_lounge: homestay.bar_lounge,
      air_conditioning: homestay.air_conditioning,
      room_service: homestay.room_service,
      laundry_service: homestay.laundry_service,
      airport_shuttle: homestay.airport_shuttle,
      family_rooms: homestay.family_rooms,
      non_smoking_rooms: homestay.non_smoking_rooms,
      breakfast_included: homestay.breakfast_included,
      kitchen_facilities: homestay.kitchen_facilities,
      balcony: homestay.balcony,
      ocean_view: homestay.ocean_view,
      garden_view: homestay.garden_view,
      wheelchair_accessible: homestay.wheelchair_accessible,
      meeting_rooms: homestay.meeting_rooms,
      conference_facilities: homestay.conference_facilities,
      security_24h: homestay.security_24h,
    };

    const fullHomestayData = {
      ...homestay.toJSON(),
      amenities: homestayAmenities,
      images: homestayImages,
      room_types: Object.values(roomTypesGrouped),
      restaurant: restaurant,
    };

    res.json({
      success: true,
      homestay: fullHomestayData,
    });
  } catch (error) {
    console.error("Error fetching homestay details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching homestay details",
      error: error.message,
    });
  }
};

// Create new homestay with rooms and restaurant
const createHomestay = async (req, res) => {
  const transaction = await Homestay.sequelize.transaction();

  try {
    // Debug: Log what we're receiving
    console.log("Request body keys:", Object.keys(req.body));
    console.log(
      "Request files keys:",
      req.files ? Object.keys(req.files) : "No files"
    );
    console.log("Raw homestay data:", req.body.homestay);

    // Parse JSON data from FormData
    const homestay = req.body.homestay ? JSON.parse(req.body.homestay) : null;
    const rooms = req.body.rooms ? JSON.parse(req.body.rooms) : [];
    const restaurant = req.body.restaurant
      ? JSON.parse(req.body.restaurant)
      : null;
    const menus = req.body.menus ? JSON.parse(req.body.menus) : [];

    console.log("Parsed homestay:", homestay);

    // Create homestay - flatten amenities into main object
    const homestayData = {
      vendor_id: req.user.user_id,
      name: homestay.name,
      description: homestay.description,
      location_id: homestay.location_id || null,
      latitude: homestay.latitude || null,
      longitude: homestay.longitude || null,
      address: homestay.address || '',
      star_rating: homestay.star_rating,
      check_in_time: homestay.check_in_time,
      check_out_time: homestay.check_out_time,
      phone: homestay.phone,
      email: homestay.email,
      cancellation_policy: homestay.cancellation_policy,
      child_policy: homestay.child_policy,
      pet_policy: homestay.pet_policy,
      total_rooms: rooms?.length || 0,
      // Flatten amenities
      free_wifi: homestay.amenities?.free_wifi || false,
      parking_available: homestay.amenities?.parking_available || false,
      pet_friendly: homestay.amenities?.pet_friendly || false,
      swimming_pool: homestay.amenities?.swimming_pool || false,
      spa: homestay.amenities?.spa || false,
      fitness_center: homestay.amenities?.fitness_center || false,
      restaurant: homestay.amenities?.restaurant || false,
      bar_lounge: homestay.amenities?.bar_lounge || false,
      air_conditioning: homestay.amenities?.air_conditioning || false,
      room_service: homestay.amenities?.room_service || false,
      laundry_service: homestay.amenities?.laundry_service || false,
      airport_shuttle: homestay.amenities?.airport_shuttle || false,
      family_rooms: homestay.amenities?.family_rooms || false,
      non_smoking_rooms: homestay.amenities?.non_smoking_rooms || false,
      breakfast_included: homestay.amenities?.breakfast_included || false,
      kitchen_facilities: homestay.amenities?.kitchen_facilities || false,
      balcony: homestay.amenities?.balcony || false,
      ocean_view: homestay.amenities?.ocean_view || false,
      garden_view: homestay.amenities?.garden_view || false,
      wheelchair_accessible: homestay.amenities?.wheelchair_accessible || false,
      meeting_rooms: homestay.amenities?.meeting_rooms || false,
      conference_facilities: homestay.amenities?.conference_facilities || false,
      security_24h: homestay.amenities?.security_24h || false,
      status: "active",
    };

    const newHomestay = await Homestay.create(homestayData, { transaction });
    let restaurantId = null; // Declare restaurantId at higher scope

    // Create room types
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        const roomData = {
          homestay_id: newHomestay.homestay_id,
          name: room.name,
          description: room.description,
          price: parseFloat(room.price) || 0,
          max_people: parseInt(room.max_people) || 1,
          size_sqm: parseInt(room.size_sqm) || null,
          included: room.included,
          // Flatten room amenities
          minibar: room.amenities?.minibar || false,
          tea_coffee_facilities: room.amenities?.tea_coffee_facilities || false,
          wardrobe_hangers: room.amenities?.wardrobe_hangers || false,
          luggage_rack: room.amenities?.luggage_rack || false,
          safe: room.amenities?.safe || false,
          air_conditioner: room.amenities?.air_conditioner || false,
          heater: room.amenities?.heater || false,
          fan: room.amenities?.fan || false,
          wifi: room.amenities?.wifi || false,
          tv: room.amenities?.tv || false,
          speaker: room.amenities?.speaker || false,
          phone: room.amenities?.phone || false,
          usb_charging_points: room.amenities?.usb_charging_points || false,
          power_adapters: room.amenities?.power_adapters || false,
          desk_workspace: room.amenities?.desk_workspace || false,
          iron_ironing_board: room.amenities?.iron_ironing_board || false,
          hairdryer: room.amenities?.hairdryer || false,
          towels: room.amenities?.towels || false,
          bathrobes: room.amenities?.bathrobes || false,
          slippers: room.amenities?.slippers || false,
          toiletries: room.amenities?.toiletries || false,
          teeth_shaving_kits: room.amenities?.teeth_shaving_kits || false,
          table_lamps: room.amenities?.table_lamps || false,
          bedside_lamps: room.amenities?.bedside_lamps || false,
          alarm_clock: room.amenities?.alarm_clock || false,
          laundry_bag: room.amenities?.laundry_bag || false,
        };

        const [roomResult] = await sequelize.query(
          `INSERT INTO room_types (homestay_id, name, description, price, max_people, size_sqm, included,
           minibar, tea_coffee_facilities, wardrobe_hangers, luggage_rack, safe, air_conditioner, heater, fan,
           wifi, tv, speaker, phone, usb_charging_points, power_adapters, desk_workspace, iron_ironing_board,
           hairdryer, towels, bathrobes, slippers, toiletries, teeth_shaving_kits, table_lamps, bedside_lamps,
           alarm_clock, laundry_bag, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          {
            replacements: [
              roomData.homestay_id,
              roomData.name,
              roomData.description,
              roomData.price,
              roomData.max_people,
              roomData.size_sqm,
              roomData.included,
              roomData.minibar,
              roomData.tea_coffee_facilities,
              roomData.wardrobe_hangers,
              roomData.luggage_rack,
              roomData.safe,
              roomData.air_conditioner,
              roomData.heater,
              roomData.fan,
              roomData.wifi,
              roomData.tv,
              roomData.speaker,
              roomData.phone,
              roomData.usb_charging_points,
              roomData.power_adapters,
              roomData.desk_workspace,
              roomData.iron_ironing_board,
              roomData.hairdryer,
              roomData.towels,
              roomData.bathrobes,
              roomData.slippers,
              roomData.toiletries,
              roomData.teeth_shaving_kits,
              roomData.table_lamps,
              roomData.bedside_lamps,
              roomData.alarm_clock,
              roomData.laundry_bag,
            ],
            transaction,
          }
        );

        // Get the room_type_id from the insert result
        const roomTypeId = roomResult.insertId || roomResult;
        
        // Create room inventory items based on room_count
        const roomCount = parseInt(room.room_count) || 1;
        if (roomCount > 0) {
          for (let i = 1; i <= roomCount; i++) {
            // Generate unit numbers (e.g., 101, 102, etc.)
            const unitNumber = `${101 + i - 1}`;
            
            await sequelize.query(
              `INSERT INTO room_inventory (room_type_id, unit_number, floor, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, NOW(), NOW())`,
              {
                replacements: [roomTypeId, unitNumber, null, 'available'],
                transaction,
              }
            );
          }
        }
      }
    }

    // Create restaurant if specified
    if (restaurant && restaurant.has_restaurant) {
      const restaurantData = {
        homestay_id: newHomestay.homestay_id,
        name: restaurant.name,
        description: restaurant.description,
        cuisine_type: restaurant.cuisine_type,
        opening_time: restaurant.opening_time,
        closing_time: restaurant.closing_time,
        contact_number: restaurant.contact_number,
        email: restaurant.email,
        status: "open",
      };

      const [restaurantResult, metadata] = await sequelize.query(
        `INSERT INTO hotel_restaurants (homestay_id, name, description, cuisine_type, opening_time, closing_time, contact_number, email, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            restaurantData.homestay_id,
            restaurantData.name,
            restaurantData.description,
            restaurantData.cuisine_type,
            restaurantData.opening_time,
            restaurantData.closing_time,
            restaurantData.contact_number,
            restaurantData.email,
            restaurantData.status,
          ],
          transaction,
        }
      );

      restaurantId = restaurantResult; // Assign to the higher scope variable
      console.log("Restaurant insert result (ID):", restaurantResult);
      console.log("Restaurant metadata (affected rows):", metadata);
      console.log("Using restaurant ID:", restaurantId);

      // Create menu items if provided
      if (menus && menus.length > 0) {
        console.log("Creating menu items:", menus.length);
        for (const menu of menus) {
          console.log("Menu item data:", menu);
          console.log("Replacements:", [
            restaurantId,
            menu.name,
            menu.description,
            parseFloat(menu.price) || 0,
            menu.available !== false,
          ]);

          await sequelize.query(
            `INSERT INTO hotel_menu (restaurant_id, name, description, price, available, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            {
              replacements: [
                restaurantId,
                menu.name,
                menu.description,
                parseFloat(menu.price) || 0,
                menu.available !== false,
              ],
              transaction,
              type: sequelize.QueryTypes.INSERT,
            }
          );
        }
      }
    }

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      console.log("Processing uploaded files:", req.files.length);

      // Homestay images
      const homestayImages = req.files.filter(
        (file) => file.fieldname === "homestay_images"
      );
      if (homestayImages.length > 0) {
        await ImageService.saveHomestayImages(
          newHomestay.homestay_id,
          homestayImages,
          transaction
        );
      }

      // Room images - associate with specific room types
      const roomIds = await sequelize.query(
        "SELECT room_type_id FROM room_types WHERE homestay_id = ? ORDER BY created_at",
        {
          replacements: [newHomestay.homestay_id],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      // Room images - process files for each room
      const roomImageFiles = req.files.filter(
        (file) =>
          file.fieldname.startsWith("room_") &&
          file.fieldname.endsWith("_images")
      );
      const roomImageGroups = {};

      // Group room images by room index
      roomImageFiles.forEach((file) => {
        const roomIndex = parseInt(file.fieldname.split("_")[1]);
        if (!roomImageGroups[roomIndex]) {
          roomImageGroups[roomIndex] = [];
        }
        roomImageGroups[roomIndex].push(file);
      });

      // Save room images for each room
      for (const [roomIndex, images] of Object.entries(roomImageGroups)) {
        if (roomIds[roomIndex]) {
          await ImageService.saveRoomImages(
            roomIds[roomIndex].room_type_id,
            images,
            transaction
          );
        }
      }

      // Restaurant images
      const restaurantImages = req.files.filter(
        (file) => file.fieldname === "restaurant_images"
      );
      if (restaurantImages.length > 0 && restaurantId) {
        await ImageService.saveRestaurantImages(
          restaurantId,
          restaurantImages,
          transaction
        );
      }

      // Menu images - associate with specific menu items
      if (restaurantId) {
        const menuIds = await sequelize.query(
          "SELECT menu_id FROM hotel_menu WHERE restaurant_id = ? ORDER BY created_at",
          {
            replacements: [restaurantId],
            type: sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        // Menu images - process files for each menu item
        const menuImageFiles = req.files.filter(
          (file) =>
            file.fieldname.startsWith("menu_") &&
            file.fieldname.endsWith("_images")
        );
        const menuImageGroups = {};

        // Group menu images by menu index
        menuImageFiles.forEach((file) => {
          const menuIndex = parseInt(file.fieldname.split("_")[1]);
          if (!menuImageGroups[menuIndex]) {
            menuImageGroups[menuIndex] = [];
          }
          menuImageGroups[menuIndex].push(file);
        });

        // Save menu images for each menu item
        for (const [menuIndex, images] of Object.entries(menuImageGroups)) {
          if (menuIds[menuIndex]) {
            await ImageService.saveMenuImages(
              menuIds[menuIndex].menu_id,
              images,
              transaction
            );
          }
        }
      }
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Homestay created successfully",
      homestay: newHomestay,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating homestay:", error);
    res.status(500).json({
      success: false,
      message: "Error creating homestay",
      error: error.message,
    });
  }
};

// Update homestay
const updateHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const homestay = await Homestay.findOne({
      where: {
        homestay_id: id,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found",
      });
    }

    await homestay.update(updateData);

    res.json({
      success: true,
      message: "Homestay updated successfully",
      homestay,
    });
  } catch (error) {
    console.error("Error updating homestay:", error);
    res.status(500).json({
      success: false,
      message: "Error updating homestay",
      error: error.message,
    });
  }
};

// Check for related rooms before deletion
const checkHomestayDependencies = async (req, res) => {
  try {
    const { id } = req.params;

    const homestay = await Homestay.findOne({
      where: {
        homestay_id: id,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found",
      });
    }

    // Get related room types
    const relatedRooms = await sequelize.query(
      `SELECT rt.room_type_id, rt.name, rt.price, 
              COUNT(DISTINCT ri.inventory_id) as total_rooms
       FROM room_types rt
       LEFT JOIN room_inventory ri ON rt.room_type_id = ri.room_type_id
       WHERE rt.homestay_id = ?
       GROUP BY rt.room_type_id, rt.name, rt.price`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      homestayName: homestay.name,
      relatedRooms: relatedRooms,
      hasRelatedRooms: relatedRooms.length > 0,
      totalRoomTypes: relatedRooms.length,
      totalRooms: relatedRooms.reduce(
        (sum, r) => sum + parseInt(r.total_rooms || 0),
        0
      ),
    });
  } catch (error) {
    console.error("Error checking homestay dependencies:", error);
    res.status(500).json({
      success: false,
      message: "Error checking homestay dependencies",
      error: error.message,
    });
  }
};

// Delete homestay (with cascade delete option)
const deleteHomestay = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { confirmed } = req.body; // Flag to confirm cascade deletion

    const homestay = await Homestay.findOne({
      where: {
        homestay_id: id,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Homestay not found",
      });
    }

    // Check for related room types
    const relatedRooms = await sequelize.query(
      `SELECT rt.room_type_id FROM room_types rt WHERE rt.homestay_id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (relatedRooms.length > 0 && !confirmed) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Homestay has related properties",
        hasRelatedRooms: true,
        requiresConfirmation: true,
      });
    }

    // If confirmed or no related rooms, proceed with deletion
    if (relatedRooms.length > 0 && confirmed) {
      const roomTypeIds = relatedRooms.map((r) => r.room_type_id);

      if (roomTypeIds.length > 0) {
        // Delete room_images FIRST (references room_types)
        await sequelize.query(
          `DELETE FROM room_images WHERE room_type_id IN (${roomTypeIds
            .map(() => "?")
            .join(",")})`,
          {
            replacements: roomTypeIds,
            type: sequelize.QueryTypes.DELETE,
            transaction,
          }
        );

        // Then delete room_inventory (references room_types)
        await sequelize.query(
          `DELETE FROM room_inventory WHERE room_type_id IN (${roomTypeIds
            .map(() => "?")
            .join(",")})`,
          {
            replacements: roomTypeIds,
            type: sequelize.QueryTypes.DELETE,
            transaction,
          }
        );
      }

      // Delete all room types
      await sequelize.query(`DELETE FROM room_types WHERE homestay_id = ?`, {
        replacements: [id],
        type: sequelize.QueryTypes.DELETE,
        transaction,
      });
    }

    // Delete restaurant data if it exists
    const restaurantData = await sequelize.query(
      `SELECT restaurant_id FROM hotel_restaurants WHERE homestay_id = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (restaurantData.length > 0) {
      const restaurantIds = restaurantData.map((r) => r.restaurant_id);
      
      // Delete menu items
      await sequelize.query(
        `DELETE FROM hotel_menu WHERE restaurant_id IN (${restaurantIds
          .map(() => "?")
          .join(",")})`,
        {
          replacements: restaurantIds,
          type: sequelize.QueryTypes.DELETE,
          transaction,
        }
      );

      // Delete restaurant images
      await sequelize.query(
        `DELETE FROM hotel_restaurant_images WHERE restaurant_id IN (${restaurantIds
          .map(() => "?")
          .join(",")})`,
        {
          replacements: restaurantIds,
          type: sequelize.QueryTypes.DELETE,
          transaction,
        }
      );

      // Delete restaurants
      await sequelize.query(`DELETE FROM hotel_restaurants WHERE homestay_id = ?`, {
        replacements: [id],
        type: sequelize.QueryTypes.DELETE,
        transaction,
      });
    }

    // Delete stock movements (references homestay_id)
    await sequelize.query(`DELETE FROM stock_movements WHERE homestay_id = ?`, {
      replacements: [id],
      type: sequelize.QueryTypes.DELETE,
      transaction,
    });

    // Delete homestay images
    await sequelize.query(`DELETE FROM homestay_images WHERE homestay_id = ?`, {
      replacements: [id],
      type: sequelize.QueryTypes.DELETE,
      transaction,
    });

    // Delete the homestay
    await homestay.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: "Homestay deleted successfully",
      deletedRoomTypes: relatedRooms.length,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting homestay:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting homestay",
      error: error.message,
    });
  }
};

// Create new room type for homestay
const createRoomType = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const homestayId = req.params.id;
    const {
      type_name,
      description,
      price,
      max_guests,
      size,
      bed_configuration,
      amenities,
    } = req.body;

    // Verify homestay ownership
    const homestay = await Homestay.findOne({
      where: {
        homestay_id: homestayId,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Homestay not found or unauthorized",
      });
    }

    // Parse amenities if it's a string
    let parsedAmenities = {};
    if (amenities) {
      try {
        parsedAmenities =
          typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      } catch (e) {
        console.error("Error parsing amenities:", e);
      }
    }

    // Create room type
    const [roomTypeId, metadata] = await sequelize.query(
      `INSERT INTO room_types (homestay_id, name, description, price, max_people, size_sqm, included,
       minibar, tea_coffee_facilities, wardrobe_hangers, luggage_rack, safe, air_conditioner, heater, fan,
       wifi, tv, speaker, phone, usb_charging_points, power_adapters, desk_workspace, iron_ironing_board,
       hairdryer, towels, bathrobes, slippers, toiletries, teeth_shaving_kits, table_lamps, bedside_lamps,
       alarm_clock, laundry_bag, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          homestayId,
          type_name || "",
          description || "",
          parseFloat(price) || 0,
          parseInt(max_guests) || 1,
          parseFloat(size) || 0,
          bed_configuration || "",
          parsedAmenities.minibar ? 1 : 0,
          parsedAmenities.tea_coffee_facilities ? 1 : 0,
          parsedAmenities.wardrobe_hangers ? 1 : 0,
          parsedAmenities.luggage_rack ? 1 : 0,
          parsedAmenities.safe ? 1 : 0,
          parsedAmenities.air_conditioner ? 1 : 0,
          parsedAmenities.heater ? 1 : 0,
          parsedAmenities.fan ? 1 : 0,
          parsedAmenities.wifi ? 1 : 0,
          parsedAmenities.tv ? 1 : 0,
          parsedAmenities.speaker ? 1 : 0,
          parsedAmenities.phone ? 1 : 0,
          parsedAmenities.usb_charging_points ? 1 : 0,
          parsedAmenities.power_adapters ? 1 : 0,
          parsedAmenities.desk_workspace ? 1 : 0,
          parsedAmenities.iron_ironing_board ? 1 : 0,
          parsedAmenities.hairdryer ? 1 : 0,
          parsedAmenities.towels ? 1 : 0,
          parsedAmenities.bathrobes ? 1 : 0,
          parsedAmenities.slippers ? 1 : 0,
          parsedAmenities.toiletries ? 1 : 0,
          parsedAmenities.teeth_shaving_kits ? 1 : 0,
          parsedAmenities.table_lamps ? 1 : 0,
          parsedAmenities.bedside_lamps ? 1 : 0,
          parsedAmenities.alarm_clock ? 1 : 0,
          parsedAmenities.laundry_bag ? 1 : 0,
        ],
        transaction,
      }
    );

    // Handle room images if uploaded
    if (req.files && req.files.length > 0) {
      const roomImages = req.files.filter(
        (file) => file.fieldname === "room_images"
      );
      if (roomImages.length > 0) {
        await ImageService.saveRoomImages(roomTypeId, roomImages, transaction);
      }
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Room type created successfully",
      roomType: {
        room_type_id: roomTypeId,
        homestay_id: homestayId,
        name: type_name,
        description,
        price,
        max_people: max_guests,
        size_sqm: size,
        included: bed_configuration,
        amenities: parsedAmenities,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating room type:", error);
    res.status(500).json({
      success: false,
      message: "Error creating room type",
      error: error.message,
    });
  }
};

// Get room types for homestay
const getRoomTypes = async (req, res) => {
  try {
    const homestayId = req.params.id;

    // Verify homestay ownership
    const homestay = await Homestay.findOne({
      where: {
        homestay_id: homestayId,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found or unauthorized",
      });
    }

    // Get room types with their images
    const [roomTypes] = await sequelize.query(
      `SELECT rt.*, ri.image_id, ri.image_path, ri.image_type
       FROM room_types rt 
       LEFT JOIN room_images ri ON rt.room_type_id = ri.room_type_id 
       WHERE rt.homestay_id = ?
       ORDER BY rt.created_at ASC, ri.image_id ASC`,
      [homestayId]
    );

    // Group room images by room type
    const roomTypesGrouped = {};
    roomTypes.forEach((room) => {
      if (!roomTypesGrouped[room.room_type_id]) {
        roomTypesGrouped[room.room_type_id] = {
          room_type_id: room.room_type_id,
          homestay_id: room.homestay_id,
          name: room.name,
          description: room.description,
          price: room.price,
          max_people: room.max_people,
          size_sqm: room.size_sqm,
          included: room.included,
          amenities: {
            wifi: room.wifi,
            tv: room.tv,
            ac: room.ac,
            heating: room.heating,
            minibar: room.minibar,
            balcony: room.balcony,
            sea_view: room.sea_view,
            mountain_view: room.mountain_view,
            garden_view: room.garden_view,
            city_view: room.city_view,
            private_bathroom: room.private_bathroom,
            shared_bathroom: room.shared_bathroom,
            hot_water: room.hot_water,
            toiletries: room.toiletries,
            towels: room.towels,
            hairdryer: room.hairdryer,
            safe: room.safe,
            work_desk: room.work_desk,
            seating_area: room.seating_area,
            wardrobe: room.wardrobe,
            blackout_curtains: room.blackout_curtains,
            soundproofing: room.soundproofing,
            daily_housekeeping: room.daily_housekeeping,
            laundry_service: room.laundry_service,
          },
          images: [],
          created_at: room.created_at,
          updated_at: room.updated_at,
        };
      }

      if (room.image_id) {
        roomTypesGrouped[room.room_type_id].images.push({
          image_id: room.image_id,
          image_path: room.image_path,
          image_type: room.image_type,
        });
      }
    });

    res.json({
      success: true,
      roomTypes: Object.values(roomTypesGrouped),
    });
  } catch (error) {
    console.error("Error fetching room types:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room types",
      error: error.message,
    });
  }
};

// Update room type
const updateRoomType = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const homestayId = req.params.id;
    const roomTypeId = req.params.roomTypeId;
    const {
      type_name,
      description,
      price,
      max_guests,
      size,
      bed_configuration,
      amenities,
    } = req.body;

    // Verify homestay ownership
    const homestay = await Homestay.findOne({
      where: {
        homestay_id: homestayId,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Homestay not found or unauthorized",
      });
    }

    // Verify room type belongs to this homestay
    const [roomTypes] = await sequelize.query(
      "SELECT * FROM room_types WHERE room_type_id = ? AND homestay_id = ?",
      {
        replacements: [roomTypeId, homestayId],
        transaction,
      }
    );

    if (!roomTypes || roomTypes.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Room type not found",
      });
    }

    // Parse amenities
    let parsedAmenities = {};
    if (amenities) {
      try {
        parsedAmenities =
          typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      } catch (error) {
        console.error("Error parsing amenities:", error);
      }
    }

    // Update room type
    await sequelize.query(
      `UPDATE room_types 
       SET name = ?, 
           description = ?, 
           price = ?, 
           max_people = ?, 
           size_sqm = ?, 
           included = ?,
           wifi = ?, tv = ?, ac = ?, heating = ?, minibar = ?, balcony = ?,
           sea_view = ?, mountain_view = ?, garden_view = ?, city_view = ?,
           private_bathroom = ?, shared_bathroom = ?, hot_water = ?, 
           toiletries = ?, towels = ?, hairdryer = ?,
           updated_at = NOW()
       WHERE room_type_id = ?`,
      {
        replacements: [
          type_name,
          description,
          price,
          max_guests,
          size,
          bed_configuration,
          parsedAmenities.wifi || false,
          parsedAmenities.tv || false,
          parsedAmenities.ac || false,
          parsedAmenities.heating || false,
          parsedAmenities.minibar || false,
          parsedAmenities.balcony || false,
          parsedAmenities.sea_view || false,
          parsedAmenities.mountain_view || false,
          parsedAmenities.garden_view || false,
          parsedAmenities.city_view || false,
          parsedAmenities.private_bathroom || false,
          parsedAmenities.shared_bathroom || false,
          parsedAmenities.hot_water || false,
          parsedAmenities.toiletries || false,
          parsedAmenities.towels || false,
          parsedAmenities.hairdryer || false,
          roomTypeId,
        ],
        transaction,
      }
    );

    // Handle new room images if uploaded
    if (req.files && req.files.length > 0) {
      const roomImages = req.files.filter(
        (file) => file.fieldname === "room_images"
      );
      if (roomImages.length > 0) {
        await ImageService.saveRoomImages(roomTypeId, roomImages, transaction);
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: "Room type updated successfully",
      roomType: {
        room_type_id: roomTypeId,
        homestay_id: homestayId,
        name: type_name,
        description,
        price,
        max_people: max_guests,
        size_sqm: size,
        included: bed_configuration,
        amenities: parsedAmenities,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating room type:", error);
    res.status(500).json({
      success: false,
      message: "Error updating room type",
      error: error.message,
    });
  }
};

// Delete room type
const deleteRoomType = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const homestayId = req.params.id;
    const roomTypeId = req.params.roomTypeId;

    // Verify homestay ownership
    const homestay = await Homestay.findOne({
      where: {
        homestay_id: homestayId,
        vendor_id: req.user.user_id,
      },
    });

    if (!homestay) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Homestay not found or unauthorized",
      });
    }

    // Verify room type belongs to this homestay
    const [roomTypes] = await sequelize.query(
      "SELECT * FROM room_types WHERE room_type_id = ? AND homestay_id = ?",
      {
        replacements: [roomTypeId, homestayId],
        transaction,
      }
    );

    if (!roomTypes || roomTypes.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Room type not found",
      });
    }

    // Get room images to delete files
    const [roomImages] = await sequelize.query(
      "SELECT image_path FROM room_images WHERE room_type_id = ?",
      {
        replacements: [roomTypeId],
        transaction,
      }
    );

    // Delete room images from database
    await sequelize.query("DELETE FROM room_images WHERE room_type_id = ?", {
      replacements: [roomTypeId],
      transaction,
    });

    // Delete room type
    await sequelize.query("DELETE FROM room_types WHERE room_type_id = ?", {
      replacements: [roomTypeId],
      transaction,
    });

    await transaction.commit();

    // Delete image files from filesystem (after commit)
    if (roomImages && roomImages.length > 0) {
      const fs = require("fs").promises;
      const path = require("path");

      for (const image of roomImages) {
        try {
          const imagePath = path.join(__dirname, "../../", image.image_path);
          await fs.unlink(imagePath);
        } catch (error) {
          console.error("Error deleting image file:", error);
          // Continue even if file deletion fails
        }
      }
    }

    res.json({
      success: true,
      message: "Room type deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting room type:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting room type",
      error: error.message,
    });
  }
};

// Get stay view data (bookings timeline for a homestay)
const getStayView = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Verify homestay ownership
    const [homestay] = await sequelize.query(
      "SELECT homestay_id, vendor_id FROM homestays WHERE homestay_id = ?",
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: "Homestay not found",
      });
    }

    if (homestay.vendor_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Build date filter
    let dateFilter = "";
    const queryParams = [id];

    if (start_date && end_date) {
      dateFilter = "AND rb.check_in_date <= ? AND rb.check_out_date >= ?";
      queryParams.push(end_date, start_date);
    }

    // Fetch bookings with room and guest information
    const query = `
      SELECT 
        rb.booking_id,
        rb.inventory_id,
        rb.check_in_date,
        rb.check_out_date,
        rb.guests,
        rb.nights,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.number_of_adults,
        rb.number_of_children,
        ri.unit_number as room_number,
        ri.floor as floor_number,
        ri.status as room_status,
        rt.name as room_type_name,
        rt.room_type_id,
        b.status as booking_status,
        b.payment_status,
        b.booking_reference,
        b.booking_source,
        b.special_requests
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      WHERE rb.homestay_id = ? ${dateFilter}
      ORDER BY COALESCE(ri.unit_number, 'Unassigned'), rb.check_in_date
    `;

    const bookings = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT,
    });

    // Fetch all rooms for the homestay
    const roomsQuery = `
      SELECT 
        ri.inventory_id,
        ri.unit_number as room_number,
        ri.floor as floor_number,
        ri.status,
        rt.name as room_type_name,
        rt.room_type_id
      FROM room_inventory ri
      INNER JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      WHERE rt.homestay_id = ?
      ORDER BY ri.unit_number
    `;

    const rooms = await sequelize.query(roomsQuery, {
      replacements: [id],
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("=== STAY VIEW DEBUG ===");
    console.log("Homestay ID:", id);
    console.log("Date Range:", start_date, "to", end_date);
    console.log("Rooms found:", rooms.length);
    console.log("Bookings found:", bookings.length);
    console.log("Bookings:", JSON.stringify(bookings, null, 2));
    console.log("======================");

    res.json({
      success: true,
      data: {
        rooms,
        bookings,
      },
    });
  } catch (error) {
    console.error("Error fetching stay view data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stay view data",
      error: error.message,
    });
  }
};

module.exports = {
  getHomestays,
  getHomestayById,
  createHomestay,
  updateHomestay,
  deleteHomestay,
  checkHomestayDependencies,
  createRoomType,
  getRoomTypes,
  updateRoomType,
  deleteRoomType,
  getStayView,
};
