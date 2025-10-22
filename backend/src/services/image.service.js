const { sequelize } = require('../../config/database');

class ImageService {
  // Save homestay images
  static async saveHomestayImages(homestayId, images, transaction) {
    if (!images || images.length === 0) return [];
    
    const imageRecords = images.map((image, index) => ({
      homestay_id: homestayId,
      image_path: image.path.replace(/\\/g, '/'), // Normalize path separators
      image_type: index === 0 ? 'main' : 'gallery',
      image_order: index
    }));

    const query = `
      INSERT INTO homestay_images (homestay_id, image_path, image_type, image_order)
      VALUES ${imageRecords.map(() => '(?, ?, ?, ?)').join(', ')}
    `;
    
    const values = imageRecords.flatMap(record => [
      record.homestay_id,
      record.image_path, 
      record.image_type,
      record.image_order
    ]);

    await sequelize.query(query, {
      replacements: values,
      transaction
    });

    return imageRecords;
  }

  // Save room type images
  static async saveRoomImages(roomTypeId, images, transaction) {
    console.log('SaveRoomImages called with:', { roomTypeId, images: images?.length, transaction: !!transaction });
    
    if (!images || images.length === 0) {
      console.log('No images to save, returning empty array');
      return [];
    }
    
    const imageRecords = images.map((image, index) => ({
      room_type_id: roomTypeId,
      image_path: image.path.replace(/\\/g, '/'),
      image_type: index === 0 ? 'main' : 'gallery',
      image_order: index
    }));

    console.log('Image records:', imageRecords);

    const query = `
      INSERT INTO room_images (room_type_id, image_path, image_type, image_order, created_at)
      VALUES ${imageRecords.map(() => '(?, ?, ?, ?, NOW())').join(', ')}
    `;
    
    const values = imageRecords.flatMap(record => [
      record.room_type_id,
      record.image_path,
      record.image_type, 
      record.image_order
    ]);

    console.log('Query:', query);
    console.log('Values:', values);

    await sequelize.query(query, {
      replacements: values,
      transaction,
      type: sequelize.QueryTypes.INSERT
    });

    return imageRecords;
  }

  // Save restaurant images to hotel_restaurant_images table
  static async saveRestaurantImages(restaurantId, images, transaction) {
    if (!images || images.length === 0) return [];
    
    const imageRecords = images.map((image, index) => ({
      restaurant_id: restaurantId,
      image_path: image.path.replace(/\\/g, '/'),
      image_type: index === 0 ? 'main' : 'gallery',
      image_order: index
    }));

    const query = `
      INSERT INTO hotel_restaurant_images (restaurant_id, image_path, image_type, image_order, created_at, updated_at)
      VALUES ${imageRecords.map(() => '(?, ?, ?, ?, NOW(), NOW())').join(', ')}
    `;
    
    const values = imageRecords.flatMap(record => [
      record.restaurant_id,
      record.image_path,
      record.image_type,
      record.image_order
    ]);

    await sequelize.query(query, {
      replacements: values,
      transaction
    });

    return imageRecords;
  }

  // Save menu item images (only first image since menu table has single image field)
  static async saveMenuImages(menuId, images, transaction) {
    if (!images || images.length === 0) return [];
    
    // Update the image field in hotel_menu table with first image only
    const mainImage = images[0];
    if (mainImage) {
      console.log(`Updating menu ${menuId} with image: ${mainImage.path}`);
      await sequelize.query(
        'UPDATE hotel_menu SET image = ? WHERE menu_id = ?',
        {
          replacements: [mainImage.path.replace(/\\/g, '/'), menuId],
          transaction
        }
      );
    }

    return [{ path: mainImage.path.replace(/\\/g, '/') }];
  }

  // Get homestay images
  static async getHomestayImages(homestayId) {
    const [results] = await sequelize.query(
      'SELECT * FROM homestay_images WHERE homestay_id = ? ORDER BY image_order',
      {
        replacements: [homestayId]
      }
    );
    return results;
  }

  // Get room images
  static async getRoomImages(roomTypeId) {
    const [results] = await sequelize.query(
      'SELECT * FROM room_images WHERE room_type_id = ? ORDER BY image_order',
      {
        replacements: [roomTypeId]
      }
    );
    return results;
  }

  // Get restaurant images
  static async getRestaurantImages(restaurantId) {
    const [results] = await sequelize.query(
      'SELECT * FROM hotel_restaurant_images WHERE restaurant_id = ? ORDER BY image_order',
      {
        replacements: [restaurantId]
      }
    );
    return results;
  }

  // Delete homestay images
  static async deleteHomestayImages(homestayId, transaction) {
    await sequelize.query(
      'DELETE FROM homestay_images WHERE homestay_id = ?',
      {
        replacements: [homestayId],
        transaction
      }
    );
  }

  // Delete room images
  static async deleteRoomImages(roomTypeId, transaction) {
    await sequelize.query(
      'DELETE FROM room_images WHERE room_type_id = ?',
      {
        replacements: [roomTypeId],
        transaction
      }
    );
  }

  // Delete restaurant images
  static async deleteRestaurantImages(restaurantId, transaction) {
    await sequelize.query(
      'DELETE FROM hotel_restaurant_images WHERE restaurant_id = ?',
      {
        replacements: [restaurantId],
        transaction
      }
    );
  }
}

module.exports = ImageService;