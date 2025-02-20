import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogapisModule } from '../logapis/logapis.module';
import { TransactionsV2Service } from './transactionsv2.service';
import { TransactionsV2Controller } from './transactionsv2.controller';
import { TransactionsCategorysService } from './categorys/transactionscategorys.service';
import { TransactionsCategorysController } from './categorys/transactionscategorys.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsCategorys, TransactionsCategorysSchema } from './categorys/schema/transactionscategorys.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { TransactionsCoaController } from './coa/transactionscoa.controller';
import { TransactionsCoaService } from './coa/transactionscoa.service';
import { TransactionsCoa, TransactionsCoaSchema } from './coa/schema/transactionscoa.schema';
import { TransactionsBalancedsService } from './balanceds/transactionsbalanceds.service';
import { TransactionsBalancedsController } from './balanceds/transactionsbalanceds.controller';
import { TransactionsBalanceds, TransactionsBalancedsSchema } from './balanceds/schema/transactionsbalanceds.schema';
import { transactionsV2, transactionsV2Schema } from './schema/transactionsv2.schema';
import { MethodepaymentsModule } from '../methodepayments/methodepayments.module';
import { SettingsModule } from '../settings/settings.module';
import { BanksModule } from '../banks/banks.module';
import { OyPgModule } from '../../paymentgateway/oypg/oypg.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
import { TransactionsProductsService } from './products/transactionsproducts.service';
import { TransactionsProductsController } from './products/transactionsproducts.controller';
import { TransactionsProducts, TransactionsProductsSchema } from './products/schema/transactionsproducts.schema';
import { AdsModule } from '../adsv2/ads/ads.module';
import { TransactionsCoinSettings, TransactionsCoinSettingsSchema } from './coin/schema/transactionscoinsettings.schema';
import { TransactionsCoinSettingsController } from './coin/transactionscoinsettings.controller';
import { TransactionsCoinSettingsService } from './coin/transactionscoinsettings.service';
import { AdsPriceCreditsModule } from '../adsv2/adspricecredits/adspricecredits.module';
import { TransactionsCredits, TransactionsCreditsSchema } from './credit/schema/transactionscredits.schema';
import { TransactionsCreditsController } from './credit/transactionscredits.controller';
import { TransactionsCreditsService } from './credit/transactionscredits.service';
import { TransactionsCoaTable, TransactionsCoaTableSchema } from './coa/schema/transactionscoatable.schema';
import { TransactionsCoaTableService } from './coa/transactionscoatable.service';
@Module({

    imports: [
        AdsPriceCreditsModule,
        AdsModule,
        UtilsModule,SettingsModule,MethodepaymentsModule,BanksModule,OyPgModule,UserbasicnewModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            { name: TransactionsCategorys.name, schema: TransactionsCategorysSchema },
            { name: TransactionsCoa.name, schema: TransactionsCoaSchema }, 
            { name: TransactionsBalanceds.name, schema: TransactionsBalancedsSchema },
            { name: TransactionsProducts.name, schema: TransactionsProductsSchema },
            { name: transactionsV2.name, schema: transactionsV2Schema },
            { name: TransactionsCoinSettings.name, schema: TransactionsCoinSettingsSchema },
            { name: TransactionsCredits.name, schema: TransactionsCreditsSchema },
            { name: TransactionsCoaTable.name, schema: TransactionsCoaTableSchema }
        ], 'SERVER_FULL')
    ],
    controllers: [TransactionsV2Controller, TransactionsCategorysController, TransactionsCoaController, TransactionsBalancedsController, TransactionsProductsController, TransactionsCoinSettingsController, TransactionsCreditsController],
    providers: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService, TransactionsBalancedsService, TransactionsProductsService, TransactionsCoinSettingsService, TransactionsCreditsService, TransactionsCoaTableService],
    exports: [TransactionsV2Service, TransactionsCategorysService, TransactionsCoaService, TransactionsBalancedsService, TransactionsProductsService, TransactionsCoinSettingsService, TransactionsCreditsService, TransactionsCoaTableService],
})
export class TransactionsV2Module { }
