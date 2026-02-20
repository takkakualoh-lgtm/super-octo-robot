"""
StarStore Telegram Bot
Webhook режим для Railway
"""

import os
import json
import logging
from aiohttp import web
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import (
    LabeledPrice,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
)
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application

# ─── Настройки ────────────────────────────────────────────────────────────
BOT_TOKEN     = os.environ["BOT_TOKEN"]
PAYMENT_TOKEN = os.environ["PAYMENT_TOKEN"]
WEBAPP_URL    = os.environ["WEBAPP_URL"]
PORT          = int(os.environ.get("PORT", 8080))

# Railway автоматически даёт эту переменную после Generate Domain
RAILWAY_DOMAIN = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "")
WEBHOOK_PATH   = f"/webhook/{BOT_TOKEN}"
WEBHOOK_URL    = f"https://{RAILWAY_DOMAIN}{WEBHOOK_PATH}"

PRICE_PER_STAR = 1.4

# ─── Инициализация ────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN)
dp  = Dispatcher()
app = web.Application()


# ─── /start ───────────────────────────────────────────────────────────────
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="⭐ Открыть магазин",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ]])
    await message.answer(
        "Добро пожаловать в StarStore! 🌟\n"
        "Купи Звёзды Telegram по лучшему курсу — 1 ⭐ = 1.4 ₽",
        reply_markup=keyboard
    )


# ─── HTTP endpoint — Mini App запрашивает invoice link ────────────────────
async def create_invoice_handler(request: web.Request):
    try:
        data  = await request.json()
        stars = int(data.get("stars", 100))
        email = data.get("email", "")

        if stars < 50:
            return web.json_response({"error": "Минимум 50 звёзд"}, status=400)

        amount_kopecks = round(stars * PRICE_PER_STAR) * 100

        link = await bot.create_invoice_link(
            title=f"⭐ {stars} Telegram Stars",
            description=f"Покупка {stars} Звёзд Telegram. Зачисление за 5 минут.",
            payload=json.dumps({"stars": stars, "email": email}),
            provider_token=PAYMENT_TOKEN,
            currency="RUB",
            prices=[LabeledPrice(label=f"⭐ {stars} Stars", amount=amount_kopecks)],
            need_email=True,
            send_email_to_provider=True,
        )

        return web.json_response({"invoice_url": link})

    except Exception as e:
        logging.error(f"Ошибка создания invoice: {e}")
        return web.json_response({"error": str(e)}, status=500)


# ─── Pre-checkout ─────────────────────────────────────────────────────────
@dp.pre_checkout_query()
async def pre_checkout(query: types.PreCheckoutQuery):
    await query.answer(ok=True)


# ─── Успешная оплата ──────────────────────────────────────────────────────
@dp.message(lambda m: m.successful_payment is not None)
async def successful_payment(message: types.Message):
    payment = message.successful_payment
    payload = json.loads(payment.invoice_payload)
    stars   = payload.get("stars", 0)

    await message.answer(
        f"✅ Оплата прошла успешно!\n\n"
        f"⭐ {stars} Звёзд будут зачислены в течение нескольких минут.\n"
        f"Сумма: {payment.total_amount // 100} ₽\n\n"
        f"Спасибо за покупку! 🎉"
    )


# ─── Startup / Shutdown ───────────────────────────────────────────────────
async def on_startup(_):
    await bot.set_webhook(WEBHOOK_URL)
    logging.info(f"✅ Webhook установлен: {WEBHOOK_URL}")

async def on_shutdown(_):
    await bot.delete_webhook()
    logging.info("Webhook удалён")


# ─── Роуты ────────────────────────────────────────────────────────────────
app.router.add_post("/create-invoice", create_invoice_handler)
app.router.add_get("/health", lambda r: web.Response(text="OK"))

app.on_startup.append(on_startup)
app.on_shutdown.append(on_shutdown)

SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path=WEBHOOK_PATH)
setup_application(app, dp, bot=bot)

# ─── Запуск ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=PORT)
