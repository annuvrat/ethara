import uuid
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_flow():
    # 1. Create a customer
    print("Testing customer creation...")
    customer_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    customer_data = {
        "name": "John Doe",
        "email": customer_email,
        "phone": "1234567890"
    }
    res = client.post("/customers", json=customer_data)
    assert res.status_code == 201
    customer = res.json()
    customer_id = customer["id"]
    print(f"Created customer ID: {customer_id}")

    # Check duplicate customer email
    res = client.post("/customers", json=customer_data)
    assert res.status_code == 400
    print("Duplicate customer email blocked correctly.")

    # 2. Create products
    print("Testing product creation...")
    sku1 = f"SKU_{uuid.uuid4().hex[:8]}"
    sku2 = f"SKU_{uuid.uuid4().hex[:8]}"
    product1_data = {
        "name": "Laptop",
        "sku": sku1,
        "price": 1000.00,
        "stock": 10
    }
    product2_data = {
        "name": "Mouse",
        "sku": sku2,
        "price": 50.00,
        "stock": 100
    }
    
    res1 = client.post("/products", json=product1_data)
    assert res1.status_code == 201
    p1 = res1.json()
    p1_id = p1["id"]
    print(f"Created product 1 ID: {p1_id}")

    res2 = client.post("/products", json=product2_data)
    assert res2.status_code == 201
    p2 = res2.json()
    p2_id = p2["id"]
    print(f"Created product 2 ID: {p2_id}")

    # Check duplicate SKU
    res = client.post("/products", json=product1_data)
    assert res.status_code == 400
    print("Duplicate SKU blocked correctly.")

    # Check negative price validation (Pydantic level)
    bad_product_data = {
        "name": "Bad Product",
        "sku": f"SKU_{uuid.uuid4().hex[:8]}",
        "price": -10.00,
        "stock": 5
    }
    res = client.post("/products", json=bad_product_data)
    assert res.status_code == 422 # Unprocessable Entity
    print("Negative price validated/blocked at Pydantic level.")

    # 3. Create an order
    print("Testing order creation...")
    order_data = {
        "customer_id": customer_id,
        "items": [
            {"product_id": p1_id, "quantity": 2},
            {"product_id": p2_id, "quantity": 5}
        ]
    }
    res = client.post("/orders", json=order_data)
    assert res.status_code == 201
    order = res.json()
    order_id = order["id"]
    print(f"Created order ID: {order_id}")
    
    # Assert automatic total amount calculation: (2 * 1000.00) + (5 * 50.00) = 2250.00
    assert order["total_amount"] == 2250.00
    print("Total amount calculated correctly.")

    # Check stock reduction
    res = client.get(f"/products/{p1_id}")
    assert res.json()["stock"] == 8 # 10 - 2
    res = client.get(f"/products/{p2_id}")
    assert res.json()["stock"] == 95 # 100 - 5
    print("Stock reduced correctly.")

    # 4. Check insufficient stock validation
    print("Testing insufficient stock validation...")
    insufficient_order = {
        "customer_id": customer_id,
        "items": [
            {"product_id": p1_id, "quantity": 9} # only 8 left
        ]
    }
    res = client.post("/orders", json=insufficient_order)
    assert res.status_code == 400
    print("Insufficient stock order blocked correctly.")

    # 5. Check Dashboard Summary
    print("Testing dashboard summary...")
    res = client.get("/dashboard/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["total_products"] >= 2
    assert summary["total_customers"] >= 1
    assert summary["total_orders"] >= 1
    print(f"Dashboard summary retrieved: {summary}")

    # 6. Delete order (stock restoration)
    print("Testing order deletion and stock restoration...")
    res = client.delete(f"/orders/{order_id}")
    assert res.status_code == 200
    
    # Check if stock restored
    res = client.get(f"/products/{p1_id}")
    assert res.json()["stock"] == 10 # restored to original
    res = client.get(f"/products/{p2_id}")
    assert res.json()["stock"] == 100 # restored to original
    print("Stock restored correctly after order deletion.")

    # 7. Clean up
    print("Cleaning up test products and customer...")
    res = client.delete(f"/products/{p1_id}")
    assert res.status_code == 200
    res = client.delete(f"/products/{p2_id}")
    assert res.status_code == 200
    res = client.delete(f"/customers/{customer_id}")
    assert res.status_code == 200
    print("Cleanup successful.")

    print("\n--- ALL TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_flow()
