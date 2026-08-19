import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Utensils, ArrowRight, Check } from 'lucide-react';
import { FoodItem, Seat, Show } from '../types/cinema';

interface FoodComboSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Seat[];
  show: Show | null;
  onProceedToCheckout: (foodCart: { item: FoodItem; quantity: number }[]) => void;
}

export const FoodComboSelectorModal: React.FC<FoodComboSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedSeats,
  show,
  onProceedToCheckout
}) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (isOpen) {
      fetch('/api/food')
        .then((res) => res.json())
        .then((data) => {
          // The API returns `foodItems`; keep this state an array so an
          // unexpected response cannot crash the modal during rendering.
          if (data.success) setFoodItems(Array.isArray(data.foodItems) ? data.foodItems : []);
        })
        .catch((error) => {
          console.error(error);
          setFoodItems([]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const cartList = foodItems
    .filter((f) => (cart[f.id] || 0) > 0)
    .map((f) => ({ item: f, quantity: cart[f.id] }));

  const foodTotal = cartList.reduce((acc, c) => acc + c.item.price * c.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Step 3 of 3</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" />
              <span>Grab Movie Snacks & Combos</span>
            </h2>
            <p className="text-xs text-slate-500">Save up to 25% with pre-booked food combos</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Food Items Grid */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1">
          {foodItems.map((food) => {
            const qty = cart[food.id] || 0;
            return (
              <div
                key={food.id}
                className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80"
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-20 h-20 object-cover rounded-xl shadow-sm flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        VEG
                      </span>
                      {food.popular && (
                        <span className="text-[10px] font-bold text-amber-500">Bestseller</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">
                      {food.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{food.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      ₹{food.price}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button
                          onClick={() => updateQuantity(food.id, -1)}
                          className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      )}
                      {qty > 0 && <span className="text-xs font-bold w-4 text-center">{qty}</span>}
                      <button
                        onClick={() => updateQuantity(food.id, 1)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{qty === 0 ? 'Add' : ''}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Checkout Summary Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Food Total: <span className="font-bold text-slate-900 dark:text-white">₹{foodTotal}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout([]);
              }}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Skip Food Add-ons
            </button>
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout(cartList);
              }}
              className="flex-1 sm:flex-initial px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-extrabold text-xs shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
