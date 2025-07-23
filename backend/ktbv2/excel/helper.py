def calculate_sp_commission_value(sp_product, trade_products):
    try:
        # Ensure sp_product is a dictionary
        if not isinstance(sp_product, dict):
            raise TypeError("sp_product must be a dictionary")

        # Get values safely
        product_code = sp_product.get("product_code")
        bl_qty = float(sp_product.get("bl_qty", 0) or 0)

        # Find the matching product in trade_products
        matched = next(
            (p for p in trade_products if isinstance(p, dict) and p.get("product_code") == product_code),
            None
        )

        if matched:
            commission_rate = float(matched.get("commission_rate", 0) or 0)
            return bl_qty * commission_rate
        return 0.0

    except (TypeError, ValueError):
        return 0.0


def calculate_pf_commission_value(sp_products, trade_products):
    commission_value = 0

    for item in sp_products:
        product_code = item.get("product_code")
        bl_qty = float(item.get("bl_qty", 0))

        matched = next(
            (p for p in trade_products if p.get("product_code") == product_code),
            None
        )

        if matched:
            commission_rate = float(matched.get("commission_rate", 0))
            commission_value += bl_qty * commission_rate

    return commission_value