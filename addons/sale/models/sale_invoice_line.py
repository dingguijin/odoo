# Part of Odoo. See LICENSE file for full copyright and licensing details.
from datetime import timedelta

from odoo import api, fields, models, _
from odoo.exceptions import UserError
from odoo.tools.misc import get_lang
from odoo.osv import expression
from odoo.tools import float_is_zero, float_compare, float_round

class SaleInvoiceLine(models.Model):
    _name = 'sale.invoice.line'
    _description = 'Sale invoice line'
    _order = 'order_id, id'

    @api.depends('invoice_tax', 'invoice_value')
    def _compute_total(self):
        for record in self:
            record.invoice_total = record.invoice_value + record.invoice_tax
        return

    order_id = fields.Many2one('sale.order', string='Order Reference', index=True, required=True, ondelete='cascade')
    name = fields.Char(string='Invoice No.')
    date = fields.Datetime(string='Date')
    rate = fields.Float(string='汇率')
    invoice_type = fields.Char(string='Type')
    expense_type = fields.Char(string='费用类型')
    invoice_value = fields.Float(string='发票金额')
    invoice_tax = fields.Float(string='税额')
    invoice_total = fields.Float(string='价税合计', compute='_compute_total', store=True)
    attachment_ids = fields.Many2many(
        'ir.attachment', 'yunmao_sale_invoice_line_ir_attachments_rel',
        'purchase_invoice_id', 'attachment_id',
        string='相关文件')


